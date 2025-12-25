# Sovereign Regalia Enemy Tracker - JSON Template v2.0

## Instructions for Claude

Create enemy data for the Sovereign Regalia TTRPG enemy tracker extension. Output must be valid JSON following the exact structure below.

---

## JSON Structure

```json
{
  "version": "2.0",
  "exportDate": "YYYY-MM-DDTHH:MM:SS.000Z",
  "encounter": "Encounter Name Here",
  "enemies": [
    {
      "id": "unique-kebab-case-id",
      "name": "Enemy Display Name",
      "type": "Humanoid|Beast|Construct|Monster|Spirit|Undead",
      "init": 0,
      "maxHp": 10,
      "currentHp": 10,
      "size": 1,
      "mov": 4,
      "eva": 9,
      "meva": 8,
      "guard": 2,
      "barrier": 1,
      "baseDamage": 1,
      "attacks": [
        {
          "name": "Attack Name",
          "bonus": 6,
          "aspect": "Physical|Magical",
          "element": "Steel|Flame|Frost|Storm|Gale|Stone|Tide|Venom|Light|Shadow|Spirit|Decay",
          "effect": "Special effect description or empty string"
        }
      ],
      "weaknesses": "Element1, Element2",
      "resistances": "Element1",
      "immunities": "",
      "absorbs": "",
      "abilityName": "",
      "abilityDesc": "ABILITY NAME: Description here.\n\nNEXT ABILITY: Another description."
    }
  ]
}
```

---

## Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier in kebab-case (e.g., "goblin-archer-a") |
| `name` | string | Display name shown on the card |
| `type` | string | One of: Humanoid, Beast, Construct, Monster, Spirit, Undead |
| `init` | number | Initiative threshold (Commanders only). Alliance rolls 2d6+INIT vs this. Use 0 for non-commanders. |
| `maxHp` | number | Maximum HP/Morale |
| `currentHp` | number | Starting HP (usually equals maxHp) |
| `size` | number | Size in spaces (1-4). Size 1 = 1 space, Size 2 = 2×2, etc. |
| `mov` | number | Movement speed in spaces |
| `eva` | number | Evasion (Physical defense threshold) |
| `meva` | number | Magical Evasion (Magical defense threshold) |
| `guard` | number | Reduces Physical damage taken |
| `barrier` | number | Reduces Magical damage taken |
| `baseDamage` | number | **NEW** Base damage added to tier damage. See guidelines below. |
| `attacks` | array | Array of attack objects (see below) |
| `weaknesses` | string | Comma-separated elements that deal +2 damage |
| `resistances` | string | Comma-separated elements that deal −2 damage |
| `immunities` | string | Comma-separated elements that deal 0 damage |
| `absorbs` | string | Comma-separated elements that heal instead of damage |
| `abilityName` | string | Leave empty (legacy field) |
| `abilityDesc` | string | Abilities in special format (see below) |

---

## Base Damage Guidelines

Base damage creates the asymmetry where Sovereigns hit harder than enemies:

| Enemy Tier | Base Damage | Example |
|------------|-------------|---------|
| Fodder/Minion | 0 | Militia, Thrall, basic Wolves |
| Soldier/Standard | 1 | Footman, Bandit, Cultist |
| Veteran/Elite | 2 | Sergeant, Zealot, Dire Wolf |
| Captain/Leader | 2-3 | Captain, Acolyte, Matriarch |
| Boss/Commander | 3-4 | Corrupted Guardian, Dragon |

**Damage Calculation:**
- Enemy Total Damage = Tier Damage (2/3/4) + Base Damage + any attack effect bonuses
- Sovereign Total Damage = Tier Damage (2/3/4) + Regalia Base Damage (1/2/4) + bonuses

This ensures Sovereigns always hit harder than equivalent enemies while enemies still threaten through numbers.

---

## Attack Object Format

```json
{
  "name": "Attack Name",
  "bonus": 7,
  "aspect": "Physical",
  "element": "Steel",
  "effect": "Effect description or empty string"
}
```

- **bonus**: Number added to 2d6 attack roll
- **aspect**: "Physical" (targets EVA, reduced by Guard) or "Magical" (targets M.EVA, reduced by Barrier)
- **element**: One of the 12 elements
- **effect**: Special properties like "Ranged 2-5", "On hit, push 1 space", etc. Leave as "" if none.

---

## Ability Format (CRITICAL)

Abilities appear as individual collapsible dropdowns in the UI. Format them like this:

```
ABILITY NAME: Description of what it does.\n\nNEXT ABILITY: Another description here.\n\nTHIRD ABILITY: And so on.
```

**Rules:**
1. Ability name must be ALL CAPS
2. Name followed by colon and space `: `
3. Description follows on same line
4. Separate each ability with `\n\n` (double newline in JSON)
5. Do NOT include "Massive" - Size already handles this
6. Do NOT include attack descriptions here - those go in the attacks array

---

## Example Enemy (Standard Soldier)

```json
{
  "id": "garrison-soldier-a",
  "name": "Garrison Soldier A",
  "type": "Humanoid",
  "init": 0,
  "maxHp": 7,
  "currentHp": 7,
  "size": 1,
  "mov": 4,
  "eva": 9,
  "meva": 8,
  "guard": 2,
  "barrier": 1,
  "baseDamage": 1,
  "attacks": [
    {
      "name": "Spear",
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
  "abilityDesc": "DISCIPLINED: Cannot be routed while a Sergeant or Captain is on the battlefield."
}
```

## Example Commander (Boss)

```json
{
  "id": "corrupted-guardian",
  "name": "Corrupted Guardian",
  "type": "Construct",
  "init": 10,
  "maxHp": 24,
  "currentHp": 24,
  "size": 2,
  "mov": 3,
  "eva": 9,
  "meva": 11,
  "guard": 4,
  "barrier": 3,
  "baseDamage": 3,
  "attacks": [
    {
      "name": "Stone Fist",
      "bonus": 8,
      "aspect": "Physical",
      "element": "Stone",
      "effect": "On hit, push target 2 spaces."
    },
    {
      "name": "Corruption Pulse",
      "bonus": 7,
      "aspect": "Magical",
      "element": "Decay",
      "effect": "All enemies within 2 spaces. On hit, target cannot restore HP until end of their next activation."
    }
  ],
  "weaknesses": "Light",
  "resistances": "Steel, Stone",
  "immunities": "Venom, Decay",
  "absorbs": "",
  "abilityName": "",
  "abilityDesc": "IMMOVABLE: Cannot be forcibly moved by any effect.\n\nSTONE SKIN: Reduces all incoming damage by 1 (applied after Guard/Barrier reduction, minimum 1 damage).\n\nCORRUPTED RESURGENCE: When first reduced to half HP (12), immediately restore 6 HP and all enemies within 3 spaces take 3 Piercing Decay damage."
}
```

---

## Enemy Tier Guidelines

| Tier | HP | Attack | Defenses | Base Dmg | Init |
|------|----|----|----------|----------|------|
| Fodder | 4-6 | +4-5 | Low | 0 | 0 |
| Soldier | 6-8 | +6-7 | Moderate | 1 | 0 |
| Veteran | 8-12 | +7-8 | Good | 2 | 0 |
| Leader | 10-16 | +7-9 | Good+ | 2-3 | 6-9 |
| Boss | 18-30+ | +8-10 | Strong | 3-4 | 9-12 |

Only ONE enemy per encounter gets init > 0 (the commander). All others use init: 0.

---

## Multiple Enemies of Same Type

When creating multiples, use LETTERS (A, B, C) not numbers:

```json
{ "id": "goblin-archer-a", "name": "Goblin Archer A", ... },
{ "id": "goblin-archer-b", "name": "Goblin Archer B", ... },
{ "id": "goblin-archer-c", "name": "Goblin Archer C", ... }
```
