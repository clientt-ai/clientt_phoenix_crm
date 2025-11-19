# Brew Packages

## Install Brew 
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Note: After installing brew, there are extra commands that brew prompts to run to setupzsh profile

- Run these commands in your terminal to add Homebrew to your **PATH** (changes based on system username):
```
echo >> /Users/jbleng-mini-02/.zprofile

echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/jbleng-mini-02/.zprofile

eval "$(/opt/homebrew/bin/brew shellenv)"
```


## Brew Packages to Install: 

```
# chrome
brew install --cask google-chrome

# sublime
brew install --cask sublime-text

# jetbrains toolbox
brew install --cask jetbrains-toolbox

# claude code
brew install --cask claude-code

# Postgres 18, 9/2025
brew install postgresql@18

# Markedit
brew install --cask markedit

# git / github:
brew install gh

# Elixir version manager 
brew install asdf

# Fly.io cli 
brew install flyctl

# Obsidian
brew install --cask obsidian

# Starship, cleans up the zsh interface
brew install starship

# Terminal Notifier
brew install terminal-notifier

# Cursor, bc they've set up ai pretty well
brew install --cask cursor

# Open sourced version of vs code
brew install --cask vscodium

# node! For playwright
brew install node

```


# .zshrc updates

```
nano ~/.zshrc
```

```

# ASDF: If `elixir -v` or `erl -v` results in "command not found," ensure your shell is properly configured to source `asdf`'s shims. Add the following lines to your shell's configuration file (e.g., `.bashrc`, `.zshrc`) and restart your terminal:

. $(brew --prefix asdf)/libexec/asdf.sh

# Postgres18: If you need to have first in your PATH, run:
export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"

# Postgres18: For compilers to find postgresql you may need to set:
export LDFLAGS="-L/opt/homebrew/opt/postgresql@18/lib"
export CPPFLAGS="-I/opt/homebrew/opt/postgresql@18/include" 

# Starship:
eval "$(starship init zsh)"

# Elixir:
export PATH="$HOME/.local/elixir/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
```

## Elixir version
```
# Add Erlang plugin to asdf
asdf plugin add erlang

# Install Erlang 27.1.2
asdf install erlang 27.1.2

# Add Elixir plugin to asdf
asdf plugin add elixir

# Install Elixir 1.18.4 compiled with OTP 27
asdf install elixir 1.18.4-otp-27

# Set default erlang version
asdf set erlang 27.1.2 --home

# Set default elixir versions
asdf set elixir 1.18.4-otp-27 --home

```

# Other useful brews
```

# Stats for osx temps and such
brew install --cask stats

# Cursor, great to just use an better vscode
brew install --cask cursor

```