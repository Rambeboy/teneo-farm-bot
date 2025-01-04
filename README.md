# TENEO FARM BOT
Teneo bot is a simple tool designed to automate the node interaction.

## Features
- Automated Node Interaction
- Support Multi-Account
- Support Proxy and non Proxy

## Prerequisites
- Git
- [Node.js](https://nodejs.org/) (version 12 or higher)

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/Rambeboy/teneo-farm-bot.git
   ```
2. Navigate to the project directory:
   ```bash
   cd teneo-farm-bot
   ```
4. Install the necessary dependencies:
   ```bash
   npm install && npm run setup
   ```

## Usage

1. Setup the `config.js` and `proxy_list.js (if you want to use proxy)` before running the script. Below how to setup this fie.
2. Configuration:

   Modify the `config.js` file with your account info
   ```bash
   nano config/config.js
   ```
   Example :
   ```
   email1,password1
   email2,password2
   email3,password3
   ```
   Modify and set the `proxy_list.js` file if you want to use proxy
   ```bash
   nano config/proxy_list.js
   ```
   Example :
   ```
   ip:port
   username:password@ip:port
   http://ip:port
   http://username:password@ip:port
   ```
3. Run the script:
   ```bash
   npm run start
   ```
   Use `A` and `D` to move/change view to other accounts, `C` to stop the script.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Note
This script only for testing purpose, using this script might violates ToS and may get your account permanently banned.
