# Desktop Pet App

A fun, interactive desktop pet application featuring animated pixel art pets (Tuxedo Cat, Tabby Cat, and Corgi). The pets wander around your screen, sleep, eat, and interact with you.

## Features

- **Multiple Pet Species**: Choose between a Tuxedo Cat, Tabby Cat, or a Corgi.
- **Dynamic Animations**: Smooth pixel art animations for idling, walking, sleeping, and more.
- **Interactive AI**: Pets have their own "AI" logic to decide when to move or rest.
- **Sprite Sheet & Frame Support**: High-quality sprite-based animations for the Corgi.
- **Customizable Backgrounds**: Switch between different environments and times of day.
- **Debug Mode**: Tools to test animations and spawn specific pets.

## Tech Stack

- **React 19**: Modern functional components and hooks.
- **Vite**: Ultra-fast development server and build tool.
- **Tailwind CSS 4**: Utility-first styling with the latest features.
- **Motion**: Fluid animations and transitions.
- **Canvas API**: High-performance pixel art rendering.
- **Lucide React**: Clean and consistent iconography.

## Local Development

Follow these steps to get the project running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone the repository** (or download the source code).
2. **Navigate to the project directory**:
   ```bash
   cd desktop-pet-app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist/` directory.

### Linting

Check for TypeScript errors:
```bash
npm run lint
```

## Project Structure

- `src/components/`: Reusable UI components (e.g., `DesktopPet.tsx`).
- `src/animations/`: Logic for calculating pet animation states and transforms.
- `src/assets/`: Images, sprite sheets, and individual animation frames.
- `src/App.tsx`: Main application logic, state management, and background handling.
- `src/index.css`: Global styles and Tailwind CSS configuration.

## License

MIT
