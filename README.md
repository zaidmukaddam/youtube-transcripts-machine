# YTM (YouTube Transcripts Machine)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzaidmukaddam%2Fyoutube-transcripts-machine&env=BROWSERBASE_API_KEY,BROWSERBASE_PROJECT_ID,OPENAI_API_KEY&envDescription=Browserbase%20credentials%20%2B%20OpenAI.%20You%20can%20configure%20your%20project%20to%20use%20Anthropic%20or%20a%20custom%20LLMClient%20in%20stagehand.config.ts&project-name=youtube-transcripts-machine&repository-name=youtube-transcripts-machine)

## Overview

YTM (YouTube Transcripts Machine) is a web application that automatically extracts timestamps and transcripts from any YouTube video. It uses browser automation with [Stagehand](https://stagehand.dev) and [BrowserBase](https://browserbase.com) to navigate to YouTube videos, extract transcript data, and present it in a clean, user-friendly interface.

## Features

- **Easy URL Input**: Simply paste any YouTube video URL to extract its transcript
- **Timestamped Transcripts**: View the complete transcript with accurate timestamps
- **Interactive Timestamps**: Click on any timestamp to jump to that exact point in the video
- **Export Options**: Copy the entire transcript to clipboard or download as a text file
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## How It Works

1. **Input**: User enters a YouTube video URL
2. **Processing**: 
   - The app uses Stagehand to automate a browser session
   - It navigates to the YouTube video
   - Opens the transcript panel
   - Extracts all transcript entries with their timestamps
3. **Output**: Displays the formatted transcript with clickable timestamps

## Technology Stack

- **Frontend**: Next.js with React
- **Browser Automation**: [Stagehand](https://stagehand.dev) SDK
- **Cloud Execution**: [BrowserBase](https://browserbase.com)
- **AI Processing**: OpenAI's GPT models for transcript extraction

## Getting Started

### Prerequisites

- Node.js and npm
- OpenAI API key
- BrowserBase API key and project ID (for cloud execution)

### Installation

```bash
# Clone the repository
git clone https://github.com/zaidmukaddam/youtube-transcripts-machine.git
cd youtube-transcripts-machine

# Install dependencies
npm install

# Set up environment variables
cp .example.env .env.local
# Add your API keys to .env.local
```

### Configuration

This project can be configured to use different LLM providers:

#### Using OpenAI (Default)
```
# In .env
OPENAI_API_KEY=your_openai_api_key
```

#### Using Anthropic Claude
1. Add your API key to .env
```
ANTHROPIC_API_KEY=your_anthropic_api_key
```
2. Update stagehand.config.ts:
```typescript
modelName: "claude-3-5-sonnet-latest"
modelClientOptions: { apiKey: process.env.ANTHROPIC_API_KEY }
```

### Running Locally

```bash
npm run dev
```

### Deploying to Production

The easiest way to deploy is using Vercel:

1. Click the "Deploy with Vercel" button above
2. Configure your environment variables
3. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Built with [Stagehand](https://stagehand.dev)
- Powered by [BrowserBase](https://browserbase.com)
- Uses OpenAI's GPT 4o Mini model for transcript processing