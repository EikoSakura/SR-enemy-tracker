# Sovereign Regalia - Enemy Tracker

An Owlbear Rodeo 2.0 extension for tracking enemies in the Sovereign Regalia TTRPG.

## Features

- **Enemy Cards**: Visual stat blocks with HP bars, combat stats, attacks, and abilities
- **Base Damage System**: Enemies have base damage that scales with threat tier
- **Multiple Attacks**: Support for enemies with multiple attack options
- **Element Interactions**: Track weaknesses, resistances, immunities, and absorbs
- **Damage Calculator**: Built-in calculator with tier selection (Noble/Royal/Imperial), critical hits, and buff tracking
- **Collapsible Abilities**: Abilities formatted with ALL CAPS headers expand on click
- **Import/Export**: Save and load enemy JSON files
- **OBR Integration**: Syncs data with Owlbear Rodeo room metadata
- **Standalone Mode**: Works without OBR using localStorage

## Installation

### In Owlbear Rodeo

1. Open Owlbear Rodeo and enter a room
2. Click the **Extensions** button (puzzle piece icon)
3. Click **Add Custom Extension**
4. Enter: `https://your-netlify-site.netlify.app/manifest.json`
5. Click Add

### Self-Hosting

1. Clone this repository
2. Deploy the `public/` folder to any static host (Netlify, GitHub Pages, etc.)
3. Use the deployed URL in Owlbear Rodeo

## Usage

### Creating Enemies

1. Click **+ Add Enemy**
2. Fill in the stats:
   - Name, Type, HP, Size, Initiative
   - Combat stats (MOV, EVA, M.EVA, Guard, Barrier)
   - **Base Damage** (see guidelines below)
   - Attacks (multiple supported)
   - Element interactions
   - Abilities (use format: `ABILITY NAME: Description`)
3. Click **Save Enemy**

### Base Damage Guidelines

| Enemy Tier | Base Damage | Examples |
|------------|-------------|----------|
| Fodder | 0 | Militia, Thralls |
| Soldier | 1 | Footmen, Bandits |
| Veteran | 2 | Sergeants, Zealots |
| Leader | 2-3 | Captains, Matriarchs |
| Boss | 3-4 | Dragons, Corrupted Guardians |

### Damage Calculator

Each enemy card has a collapsible damage calculator:

1. Select a **Hit Tier** (Noble: 2, Royal: 3, Imperial: 4)
2. Toggle **Critical** for ×3 damage
3. Adjust **Base Dmg**, **+Damage**, and **−Reduction** as needed
4. Click **Apply** to deal the calculated damage

### Import/Export

- **Export**: Downloads all enemies as a JSON file
- **Import**: Load enemies from a JSON file (can replace or add to existing)

## JSON Format

See `enemy-json-template.md` for the complete JSON schema.

Quick example:

```json
{
  "version": "2.0",
  "encounter": "Bandit Ambush",
  "enemies": [
    {
      "id": "bandit-thug-a",
      "name": "Bandit Thug A",
      "type": "Humanoid",
      "init": 0,
      "maxHp": 6,
      "currentHp": 6,
      "size": 1,
      "mov": 4,
      "eva": 9,
      "meva": 8,
      "guard": 1,
      "barrier": 0,
      "baseDamage": 1,
      "attacks": [
        {
          "name": "Club",
          "bonus": 6,
          "aspect": "Physical",
          "element": "Steel",
          "effect": ""
        }
      ],
      "weaknesses": "",
      "resistances": "",
      "immunities": "",
      "absorbs": "",
      "abilityName": "",
      "abilityDesc": "DESPERATE: At half HP or below, gains +1 to attack rolls."
    }
  ]
}
```

## File Structure

```
sr-enemy-tracker/
├── public/
│   ├── manifest.json     # OBR extension manifest
│   ├── index.html        # Main application
│   ├── icon.svg          # Extension icon
│   └── _headers          # CORS headers for Netlify
├── enemy-json-template.md # JSON schema documentation
└── README.md
```

## Development

This is a single-file HTML application with no build step required. Edit `public/index.html` and redeploy.

### OBR SDK

The extension uses the Owlbear Rodeo SDK loaded from CDN:
```javascript
import OBR from 'https://unpkg.com/@owlbear-rodeo/sdk@latest/dist/index.js';
```

### Data Storage

- **OBR Mode**: Room metadata (`OBR.room.getMetadata/setMetadata`)
- **Standalone Mode**: localStorage (`sr-enemies` key)

## License

MIT

## Credits

Built for the **Sovereign Regalia** TTRPG by Eiko.
