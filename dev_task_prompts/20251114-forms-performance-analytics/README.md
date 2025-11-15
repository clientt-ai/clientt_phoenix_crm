# Forms Builder - Performance & Analytics Strategy

**Type**: Performance Research & Analytics Design
**Priority**: 🟡 Medium
**Status**: Needs Investigation
**Created**: 2025-11-14

## Overview

This dev_prompt focuses on performance optimization strategies and analytics requirements for the Forms Builder module. Critical for scalability and product insights.

## Parent Task

Source: `dev_task_prompts/20251114-forms-builder-module/ISSUES.md`
- Concern #1: Performance at Scale
- Concern #4: Analytics & Reporting
- Question #6: Calendar Availability Caching

---

## Performance Considerations

### Performance Goal #1: Form Submissions at Scale

**Challenge**: Handle high-volume form submissions without degrading performance

**Current Specification**:
- FormSubmission creates new database record per submission
- No caching mentioned
- No async processing mentioned

**Scenarios to Optimize**:

#### Scenario A: Viral Campaign
- Marketing campaign goes viral
- 10,000 form submissions in 1 hour
- Peak: 100 submissions/minute
- Database write load

**Performance Targets**:
- [ ] Form submission API response < 200ms (p95)
- [ ] Database write throughput > 200 writes/second
- [ ] No data loss during peak load
- [ ] Graceful degradation if overloaded

#### Scenario B: Demo Day Traffic
- Company launches new product
- 1,000 concurrent users filling out forms
- 500 calendar booking requests/hour
- External API calls to Google/Microsoft

**Performance Targets**:
- [ ] LiveView connection handles 1,000 concurrent users
- [ ] Calendar availability checks < 500ms (p95)
- [ ] Booking creation < 1 second (p95)

**Research Questions**:
- [ ] Should form submissions be processed asynchronously?
- [ ] Should we use a message queue (Oban, RabbitMQ)?
- [ ] How to handle duplicate submissions (double-click)?
- [ ] Database connection pooling configuration?

**Optimization Strategies**:

#### Strategy 1: Async Form Submission Processing
```elixir
# Instead of immediate processing
FormSubmissions.create(params)
|> trigger_post_submission_actions()  # Slow!

# Use background job
FormSubmissions.create(params)
|> enqueue_post_submission_job()  # Fast!
```

**Pros**:
- Fast response time (< 100ms)
- Non-blocking
- Can retry failures

**Cons**:
- Delayed post-submission actions
- Need job queue
- More complex error handling

#### Strategy 2: Database Optimizations
```elixir
# Add indexes
create index(:form_submissions, [:company_id, :inserted_at])
create index(:form_submissions, [:form_id, :inserted_at])
create index(:form_submissions, ["(data->>'email')"])  # JSONB index

# Use database partitioning for large tables
# Partition by month for form_submissions
defmodule Forms.Repo.Migrations.PartitionFormSubmissions do
  def up do
    execute """
    CREATE TABLE form_submissions_202501 PARTITION OF form_submissions
      FOR VALUES FROM ('2025-01-01') TO ('2025-02-01')
    """
  end
end
```

#### Strategy 3: Read Replicas
- Write to primary database
- Read submissions from replica
- Reduces load on primary

**Research Tasks**:
- [ ] Benchmark form submission create time
- [ ] Load test with 1,000+ concurrent submissions
- [ ] Test async processing with Oban
- [ ] Benchmark JSONB queries
- [ ] Test database partitioning

---

### Performance Goal #2: Live Preview in Form Builder

**Challenge**: Real-time form preview updates without lag

**Current Specification**:
- Live preview shows form as user edits
- Updates should feel instant
- Drag-drop reordering should be smooth

**Performance Targets**:
- [ ] Preview updates < 300ms perceived delay
- [ ] Drag-drop at 60fps
- [ ] No flickering or layout shifts
- [ ] Auto-save without blocking UI

**Research Questions**:
- [ ] Should preview render client-side or server-side?
- [ ] How to debounce updates (300ms, 500ms, 1000ms)?
- [ ] Use LiveView Streams for field updates?
- [ ] Optimistic UI for drag-drop?

**Optimization Strategies**:

#### Strategy 1: Debounced Updates
```elixir
# In LiveView
def handle_event("field_updated", params, socket) do
  # Cancel existing timer
  if socket.assigns[:update_timer] do
    Process.cancel_timer(socket.assigns.update_timer)
  end

  # Schedule update after 300ms
  timer = Process.send_after(self(), {:save_field, params}, 300)

  {:noreply, assign(socket, update_timer: timer)}
end

def handle_info({:save_field, params}, socket) do
  # Actually save the field
  FormFields.update(params)
  {:noreply, socket}
end
```

#### Strategy 2: Client-Side Preview Rendering
```javascript
// Alpine.js for instant preview updates
<div x-data="formPreview" x-init="init()">
  <template x-for="field in fields">
    <div x-show="!field.hidden" x-html="renderField(field)"></div>
  </template>
</div>
```

**Pros**:
- Instant updates (no server round-trip)
- Reduces LiveView load

**Cons**:
- Duplicate rendering logic (server + client)
- More JavaScript complexity

#### Strategy 3: LiveView Streams
```elixir
# Use streams for field list
def mount(_params, _session, socket) do
  {:ok, stream(socket, :fields, FormFields.list())}
end

def handle_event("reorder_fields", %{"old" => old_idx, "new" => new_idx}, socket) do
  # Optimistic update
  {:noreply, stream_delete_by_dom_id(socket, :fields, "field-#{old_idx}")
             |> stream_insert(:fields, updated_field, at: new_idx)}
end
```

**Research Tasks**:
- [ ] Prototype debounced updates
- [ ] Prototype client-side preview
- [ ] Benchmark LiveView Streams
- [ ] Test drag-drop with 100+ fields

---

### Performance Goal #3: Chatbot Real-Time Messages

**Challenge**: Real-time chatbot messages with many concurrent conversations

**Current Specification**:
- ChatbotConversation uses LiveView
- Real-time updates via Phoenix PubSub
- Messages stored in database

**Performance Targets**:
- [ ] Message delivery < 100ms
- [ ] Support 1,000+ concurrent chats
- [ ] No message loss
- [ ] Graceful scaling

**Research Questions**:
- [ ] Should messages be stored in-memory (GenServer) or database?
- [ ] How to scale PubSub across multiple nodes?
- [ ] Should we use Redis for PubSub?
- [ ] Message pagination strategy (load history)?

**Optimization Strategies**:

#### Strategy 1: In-Memory Message Buffer
```elixir
defmodule Forms.ChatbotSession do
  use GenServer

  # Keep last 100 messages in memory
  def init(conversation_id) do
    messages = ChatbotConversations.load_recent_messages(conversation_id, limit: 100)
    {:ok, %{messages: messages, conversation_id: conversation_id}}
  end

  # Fast message append
  def handle_cast({:new_message, message}, state) do
    messages = state.messages ++ [message]

    # Async database write
    Task.start(fn -> ChatbotConversations.append_message(state.conversation_id, message) end)

    # Broadcast to PubSub
    Phoenix.PubSub.broadcast(ClienttCrmApp.PubSub, "chatbot:#{state.conversation_id}", {:new_message, message})

    {:noreply, %{state | messages: messages}}
  end
end
```

#### Strategy 2: Message Pagination
```elixir
# Load only recent messages by default
def mount(%{"conversation_id" => id}, _session, socket) do
  messages = ChatbotConversations.list_messages(id, limit: 50, order_by: :desc)
  {:ok, assign(socket, messages: messages, has_more: length(messages) == 50)}
end

# Load more on scroll to top
def handle_event("load_more", _params, socket) do
  oldest_message_id = List.first(socket.assigns.messages).id
  older_messages = ChatbotConversations.list_messages_before(oldest_message_id, limit: 50)

  {:noreply, assign(socket, messages: older_messages ++ socket.assigns.messages)}
end
```

**Research Tasks**:
- [ ] Benchmark PubSub message delivery
- [ ] Test with 1,000 concurrent chatbot sessions
- [ ] Test message pagination UX
- [ ] Load test Phoenix Channels

---

### Performance Goal #4: Calendar Availability Caching

**Challenge**: Frequent calendar availability checks to external APIs

**Current Specification** (from ISSUES.md):
- 5-minute cache TTL suggested
- Need to check availability before booking
- Google/Microsoft have rate limits

**Performance Targets**:
- [ ] Availability check < 500ms (p95)
- [ ] Stay within API rate limits
- [ ] Cache hit rate > 80%
- [ ] Cache invalidation on booking

**Research Questions**:
- [ ] What's acceptable staleness? (1 min, 5 min, 15 min?)
- [ ] Should cache be in-memory (ETS) or Redis?
- [ ] How to invalidate cache when booking created?
- [ ] Should we prefetch availability for common times?

**Optimization Strategies**:

#### Strategy 1: ETS-Based Availability Cache
```elixir
defmodule Integrations.AvailabilityCache do
  @table :calendar_availability
  @ttl :timer.minutes(5)

  def get_availability(connection_id, date_range) do
    key = cache_key(connection_id, date_range)

    case :ets.lookup(@table, key) do
      [{^key, availability, inserted_at}] ->
        if cache_fresh?(inserted_at) do
          {:ok, availability}
        else
          :ets.delete(@table, key)
          {:error, :cache_expired}
        end

      [] ->
        {:error, :cache_miss}
    end
  end

  def put_availability(connection_id, date_range, availability) do
    key = cache_key(connection_id, date_range)
    :ets.insert(@table, {key, availability, System.monotonic_time(:millisecond)})
  end

  defp cache_fresh?(inserted_at) do
    System.monotonic_time(:millisecond) - inserted_at < @ttl
  end
end
```

#### Strategy 2: Cache Invalidation on Booking
```elixir
# When booking created, invalidate cache
def handle_event({:booking_created, booking}, socket) do
  # Invalidate availability cache for that day
  AvailabilityCache.invalidate(booking.calendar_connection_id, booking.scheduled_at)

  {:noreply, socket}
end
```

#### Strategy 3: Prefetch Common Times
```elixir
# Background job prefetches availability for next 7 days
defmodule Integrations.AvailabilityPrefetchJob do
  use Oban.Worker, queue: :integrations

  def perform(_job) do
    CalendarConnections.list_active()
    |> Enum.each(&prefetch_availability/1)
  end

  defp prefetch_availability(connection) do
    # Fetch next 7 days
    date_ranges = build_date_ranges(Date.utc_today(), days: 7)

    Enum.each(date_ranges, fn range ->
      availability = CalendarAPI.get_availability(connection, range)
      AvailabilityCache.put_availability(connection.id, range, availability)
    end)
  end
end
```

**Research Tasks**:
- [ ] Benchmark ETS vs Redis for caching
- [ ] Test cache hit rates with different TTLs
- [ ] Measure API call reduction
- [ ] Test prefetch strategy effectiveness

---

### Performance Benchmarking Plan

**Week 1: Baseline Metrics**
- [ ] Form submission create time (no load)
- [ ] Form builder page load time
- [ ] Chatbot message delivery time
- [ ] Calendar availability API call time

**Week 2: Load Testing**
- [ ] Load test form submissions (100/sec)
- [ ] Load test concurrent LiveView connections (1,000 users)
- [ ] Load test chatbot (100 concurrent conversations)
- [ ] Load test calendar availability (100 requests/sec)

**Week 3: Optimization Implementation**
- [ ] Implement async form submission processing
- [ ] Implement debounced preview updates
- [ ] Implement availability caching
- [ ] Implement database indexes

**Week 4: Re-benchmark & Tune**
- [ ] Measure improvements
- [ ] Identify remaining bottlenecks
- [ ] Document findings

**Tools**:
- [k6](https://k6.io/) - Load testing
- [Benchee](https://github.com/bencheeorg/benchee) - Elixir benchmarking
- [Phoenix LiveDashboard](https://hexdocs.pm/phoenix_live_dashboard) - Metrics
- [Telemetry](https://hexdocs.pm/telemetry) - Instrumentation

---

## Analytics & Reporting

### Analytics Goal #1: Form Performance Metrics

**Questions to Answer**:
- Which forms have highest conversion rates?
- Which fields cause most abandonment?
- What's average time to complete form?
- Which traffic sources convert best?

**Metrics to Track**:

```elixir
%{
  form_id: uuid,
  metrics: %{
    # Submissions
    total_submissions: 1234,
    submissions_this_week: 45,
    submissions_this_month: 156,

    # Conversion
    form_views: 5000,
    conversion_rate: 0.25,  # 25% of views submit

    # Completion time
    avg_completion_time_seconds: 45,
    median_completion_time_seconds: 30,

    # Field-level
    field_abandonment: %{
      "email" => 0.05,       # 5% abandon at email field
      "company_size" => 0.12  # 12% abandon here
    },

    # Traffic sources
    submissions_by_source: %{
      direct: 500,
      google: 300,
      facebook: 200,
      other: 234
    },

    # Devices
    submissions_by_device: %{
      desktop: 800,
      mobile: 300,
      tablet: 134
    }
  }
}
```

**Implementation Approach**:

#### Option A: Real-Time Event Stream
```elixir
# Track events via Phoenix PubSub
defmodule Forms.Analytics.Events do
  def track_form_view(form_id, metadata) do
    Phoenix.PubSub.broadcast(ClienttCrmApp.PubSub, "analytics", %{
      event: :form_viewed,
      form_id: form_id,
      timestamp: DateTime.utc_now(),
      metadata: metadata
    })
  end

  def track_form_submission(form_id, submission_id, metadata) do
    Phoenix.PubSub.broadcast(ClienttCrmApp.PubSub, "analytics", %{
      event: :form_submitted,
      form_id: form_id,
      submission_id: submission_id,
      timestamp: DateTime.utc_now(),
      metadata: metadata
    })
  end
end

# Analytics aggregator GenServer
defmodule Forms.Analytics.Aggregator do
  use GenServer

  def handle_info({:form_viewed, event}, state) do
    # Increment view counter
    Analytics.increment_counter("form_views", event.form_id)
    {:noreply, state}
  end

  def handle_info({:form_submitted, event}, state) do
    # Increment submission counter
    # Calculate conversion rate
    Analytics.record_submission(event.form_id, event.metadata)
    {:noreply, state}
  end
end
```

#### Option B: External Analytics Service
- Use Google Analytics
- Use Mixpanel
- Use Segment

**Pros**: Battle-tested, rich dashboards
**Cons**: External dependency, cost, data privacy

#### Option C: Database Aggregation (Batch)
```elixir
# Nightly job to aggregate analytics
defmodule Forms.Analytics.AggregationJob do
  use Oban.Worker, queue: :analytics

  def perform(_job) do
    date = Date.utc_today()

    forms = Forms.list_forms()
    Enum.each(forms, fn form ->
      metrics = calculate_metrics(form, date)
      Analytics.store_daily_metrics(form.id, date, metrics)
    end)
  end

  defp calculate_metrics(form, date) do
    %{
      submissions_count: FormSubmissions.count_for_date(form.id, date),
      avg_completion_time: FormSubmissions.avg_completion_time(form.id, date),
      conversion_rate: calculate_conversion_rate(form, date)
    }
  end
end
```

**Recommendation**: Option A (Real-time event stream) + Option C (Daily aggregation for historical reports)

---

### Analytics Goal #2: Lead Quality Scoring

**Questions to Answer**:
- Which lead sources produce highest quality?
- What's the lead-to-customer conversion rate?
- Which forms capture most qualified leads?

**Metrics to Track**:

```elixir
%{
  lead_id: uuid,
  lead_score: 85,  # 0-100
  lead_quality: :high,  # :low, :medium, :high
  metrics: %{
    # Engagement
    chatbot_interactions: 5,
    form_submissions: 2,
    pages_visited: 12,
    time_on_site_seconds: 450,

    # Qualification
    company_size: "51+",
    budget_indicated: "$10k-50k",
    intent: :demo_booking,  # :demo_booking, :pricing, :features

    # Conversion
    demo_booked: true,
    demo_completed: false,
    became_customer: false,
    customer_conversion_date: nil
  }
}
```

**Lead Scoring Algorithm** (from ChatbotLead spec):
```elixir
defmodule Forms.LeadScoring do
  def calculate_score(lead) do
    intent_score = intent_score(lead.intent)            # 0-30
    engagement_score = engagement_score(lead)           # 0-25
    company_fit_score = company_fit_score(lead)         # 0-20
    behavioral_score = behavioral_score(lead)           # 0-15
    source_quality_score = source_quality_score(lead)   # 0-10

    total = intent_score + engagement_score + company_fit_score + behavioral_score + source_quality_score
    min(total, 100)
  end

  defp intent_score(:demo_booking), do: 30
  defp intent_score(:pricing_inquiry), do: 25
  defp intent_score(:features_question), do: 15
  defp intent_score(:general_inquiry), do: 10

  defp engagement_score(lead) do
    # More interactions = higher score
    min(lead.chatbot_interactions * 5, 25)
  end

  defp company_fit_score(lead) do
    # Larger companies score higher
    case lead.company_size do
      "51+" -> 20
      "11-50" -> 15
      "1-10" -> 10
      _ -> 0
    end
  end
end
```

**Analytics Dashboard**:
- Lead score distribution (histogram)
- Lead conversion funnel
- Lead source comparison
- Time-to-conversion metrics

---

### Analytics Goal #3: Calendar Booking Analytics

**Questions to Answer**:
- What's the booking completion rate?
- What's the average time from form to booking?
- Which time slots are most popular?
- What's the no-show rate?

**Metrics to Track**:

```elixir
%{
  company_id: uuid,
  metrics: %{
    # Bookings
    total_bookings: 456,
    bookings_this_week: 12,
    booking_completion_rate: 0.85,  # 85% complete booking flow

    # Timing
    avg_time_to_book_minutes: 120,  # 2 hours from form to booking
    most_popular_time_slots: [
      %{day: "Tuesday", hour: 14, count: 45},
      %{day: "Wednesday", hour: 10, count: 42}
    ],

    # Outcomes
    completed_count: 380,
    cancelled_count: 50,
    no_show_count: 26,
    no_show_rate: 0.057  # 5.7%
  }
}
```

**Research Questions**:
- [ ] Should we integrate with external analytics (Google Analytics)?
- [ ] Real-time dashboards or daily reports?
- [ ] What retention period for raw analytics data?
- [ ] Need data warehouse for historical analysis?

---

## Deliverables

### Performance Deliverables
1. **Performance Benchmark Report** (`PERFORMANCE_BENCHMARKS.md`)
   - Baseline metrics
   - Load test results
   - Optimization recommendations

2. **Optimization Implementation**
   - Async processing
   - Caching strategies
   - Database indexes

3. **Scalability Plan** (`SCALABILITY_PLAN.md`)
   - Horizontal scaling strategy
   - Database scaling (read replicas, partitioning)
   - CDN for static assets

### Analytics Deliverables
1. **Analytics Architecture** (`ANALYTICS_ARCHITECTURE.md`)
   - Event tracking design
   - Metrics definitions
   - Aggregation strategy

2. **Analytics Dashboard Specs**
   - Forms performance dashboard
   - Lead quality dashboard
   - Booking analytics dashboard

3. **Analytics Implementation**
   - Event tracking code
   - Aggregation jobs
   - Dashboard LiveViews

---

## Timeline

**Week 1-2**: Performance benchmarking
**Week 3-4**: Optimization implementation
**Week 5-6**: Analytics design and implementation
**Week 7**: Load testing and tuning
**Week 8**: Documentation and review

---

## Success Metrics

### Performance Success Criteria
- [ ] Form submission < 200ms (p95)
- [ ] LiveView supports 1,000 concurrent users
- [ ] Chatbot message delivery < 100ms
- [ ] Calendar availability < 500ms (p95)
- [ ] 99.9% uptime

### Analytics Success Criteria
- [ ] All key metrics tracked
- [ ] Dashboards provide actionable insights
- [ ] Real-time updates (< 1 minute delay)
- [ ] Historical data retention (1 year+)

---

## Decision Template

### Performance Decisions
- [ ] **Form Submission Processing**: Sync / Async
- [ ] **Preview Rendering**: Server-side / Client-side / Hybrid
- [ ] **Availability Cache**: ETS / Redis / None
- [ ] **Cache TTL**: ___ minutes
- [ ] **Database Partitioning**: Yes / No

### Analytics Decisions
- [ ] **Analytics Provider**: Internal / Google Analytics / Mixpanel
- [ ] **Event Stream**: Phoenix PubSub / External
- [ ] **Aggregation Frequency**: Real-time / Hourly / Daily
- [ ] **Data Retention**: ___ days/years

---

**Status**: Awaiting Performance Testing
**Owner**: TBD
**Start Date**: TBD
