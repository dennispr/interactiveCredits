# Interactive Credits - Visit the Workshop! 🏢

An interactive credits system inspired by Whittier, Alaska - where everyone lives under one roof. This project showcases patrons and supporters as NPCs living in individual rooms within "The Workshop" building.

## Features

- **Interactive Building Navigation**: Explore multiple floors with hallways and individual rooms
- **Patron Showcase**: Each patron is represented as an NPC with their own dedicated room
- **Room Interactions**: Each room contains:
  - NPC that paces around and can be talked to
  - Personal item representing the patron
  - Custom poster/artwork
  - Unique dialogue and personality
- **Multi-floor Building**: Navigate between floors using the elevator system
- **Game-like Controls**: 
  - Arrow keys for movement
  - Spacebar for interactions
  - Escape to exit rooms/scenes

## Inspiration

This project draws inspiration from Whittier, Alaska - a unique community where nearly all residents live in a single building called Begich Towers. Just like that real-world community, our Workshop brings together all our supporters under one virtual roof, each with their own space and story to tell.

## Technology Stack

- **Pixi.js**: 2D rendering and game engine
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast development build tool
- **Modern Web Standards**: ES2020+ features

## Getting Started

### Prerequisites
- Node.js (v16 or higher)  
- npm or yarn package manager

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd interactiveCredits
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open your browser to `http://localhost:3000`

### Building for Production

\`\`\`bash
# Full production build with all checks
npm run build:prod

# Quick build without pre-checks  
npm run build

# Development build (with more debugging features)
npm run build:dev
\`\`\`

### Deployment

1. **Prepare for deployment**:
   \`\`\`bash
   npm run deploy:prepare
   \`\`\`
   This runs linting, type-checking, and production build.

2. **Preview the built application**:
   \`\`\`bash
   npm run serve
   \`\`\`
   Builds and serves the app locally to test before deployment.

3. **Deploy the `dist/` folder** to your hosting service:
   - **Netlify**: Drag and drop the `dist` folder or connect your Git repo
   - **Vercel**: Use `vercel --prod` or connect your Git repo  
   - **GitHub Pages**: Copy `dist` contents to your `gh-pages` branch
   - **Static hosting**: Upload `dist` folder contents to your web server

### Development Workflow

\`\`\`bash
# Start development
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Clean build artifacts
npm run clean

# Full pre-deployment check
npm run prebuild
\`\`\`

## Project Structure

\`\`\`
src/
├── config/          # Game configuration and constants
├── core/            # Core game systems (Scene management, etc.)
├── data/            # Patron data and game content
├── scenes/          # Game scenes (Start, Hallway, Room, etc.)
├── types/           # TypeScript type definitions
├── utils/           # Utility classes and helpers
└── styles/          # CSS styles
\`\`\`

## Game Flow

1. **Start Screen**: Welcome screen with title and navigation options
2. **About Screen**: Information about the interactive credits system
3. **Transition**: "Now entering the workshop!" loading screen
4. **Building Navigation**: 
   - Hallway view with doors to individual patron rooms
   - Elevator for floor-to-floor travel
   - Room assignment system (specific or sequential)
5. **Individual Rooms**: 
   - Meet patron NPCs
   - Interact with their personal items
   - View their posters/artwork
   - Read their personal messages

## Adding New Patrons

Patrons are defined in `src/data/patrons.json`. Each patron can have:

\`\`\`json
{
  "id": "unique_id",
  "name": "Patron Name",
  "dialogText": "What they say when you talk to them",
  "tier": "bronze|silver|gold|diamond",
  "floor": 2,           // Optional: specific floor assignment
  "roomNumber": 3,      // Optional: specific room assignment
  "joinDate": "2024-01-15",
  "specialNotes": "Any special information"
}
\`\`\`

## Customization

### Visual Assets
Currently using colored placeholder blocks. To add custom assets:
- Replace placeholder colors in `GameConfig.ts`
- Add image loading in the appropriate scene classes
- Update sprite creation methods

### Room Layouts
Modify room generation in `RoomScene.ts` to customize:
- Room dimensions and layout
- Interactive element positioning  
- Background patterns and decorations

### Building Structure
Adjust building layout in `GameConfig.ts`:
- `ROOMS_PER_FLOOR`: Number of rooms per floor
- `MAX_FLOORS`: Maximum building height
- Room assignment logic in `PatronManager.ts`

## Controls

- **Arrow Keys**: Move left/right in hallways and rooms
- **Spacebar**: Interact with NPCs, items, doors, and elevator
- **Escape**: Exit rooms, close dialogs, return to previous screen

## Development

### Available Scripts

- `npm run dev` / `npm start`: Start development server
- `npm run build`: Quick production build
- `npm run build:dev`: Development build with debugging features
- `npm run build:prod`: Full production build with all pre-checks
- `npm run preview`: Preview production build locally
- `npm run serve`: Build and serve for testing
- `npm run lint`: Run ESLint code quality checks  
- `npm run type-check`: Run TypeScript type checking
- `npm run clean`: Remove build artifacts
- `npm run prebuild`: Run all pre-build checks (lint + type-check)
- `npm run deploy:prepare`: Full deployment preparation

### Code Style
- TypeScript with strict mode enabled
- ESLint for code quality
- Modular architecture with clear separation of concerns

## Future Enhancements

- [ ] Custom sprite assets for NPCs and items
- [ ] Animated NPC behaviors and interactions  
- [ ] Room customization per patron tier
- [ ] Sound effects and background music
- [ ] Save/load system for visitor progress
- [ ] Social features (comments, reactions)
- [ ] Mobile touch controls
- [ ] Accessibility improvements

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)  
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the unique community of Whittier, Alaska
- Built with the amazing Pixi.js library
- Thanks to all the patrons who make this project possible!