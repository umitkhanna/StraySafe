# StraySafe Color Schemes Documentation

## Current Active Scheme (Gradient Paw Design)

### Logo Colors
- **Primary Gradients:**
  - Golden Yellow (#FFD700) → Orange (#FFA500) → Tomato Red (#FF6347) → Crimson (#DC143C)
  - Golden Yellow (#FFD700) → Tomato Red (#FF6347) → Dark Magenta (#8B008B)
  - Orange (#FFA500) → Deep Pink (#FF1493)
  - Golden Yellow (#FFD700) → Tomato Red (#FF6347)
  - Tomato Red (#FF6347) → Crimson (#DC143C) → Dark Magenta (#8B008B)

### Background Colors
- **Main Background:** Slate-900 to Slate-800 to Slate-900 gradient
- **Accent Patterns:** Orange-300, Red-300, Pink-300
- **Text Colors:** Slate-200, Slate-300, Slate-400

### Component Colors
- **Success/Primary:** Orange-400, Red-400, Pink-400 variations
- **Cards:** White backgrounds with warm accent borders
- **Buttons:** Maintaining current button colors but can be updated

---

## Previous Scheme (Blue-based - for reverting)

### Logo Colors
- **Primary:** Blue-500 (#3B82F6) to Blue-600 (#2563EB) gradient
- **Background:** Circular blue gradient container

### Background Colors
- **Main Background:** Blue-900 to Blue-800 to Indigo-900 gradient
- **Accent Patterns:** White, Blue-300, Indigo-300
- **Text Colors:** Blue-100, Blue-200, Blue-300

### Component Colors
- **Success/Primary:** Green-400, Blue-500, Indigo-500
- **Cards:** White backgrounds with blue accent borders
- **Buttons:** Blue-600 to Blue-700 gradients

---

## To Revert to Blue Scheme

1. **Logo Component:** 
   - Change gradients back to blue variations
   - Restore circular container design
   - Use single color fills instead of complex gradients

2. **Login Page:**
   - Background: `from-blue-900 via-blue-800 to-indigo-900`
   - Patterns: `bg-white`, `bg-blue-300`, `bg-indigo-300`
   - Text: `text-blue-100`, `text-blue-200`, `text-blue-300`
   - Features: `bg-green-400 bg-opacity-20`, `text-green-300`

3. **Other Pages:**
   - Maintain existing blue-based color schemes
   - Keep current sidebar and navigation colors
   - Preserve blue accent colors throughout

---

## Usage Notes

- Current implementation uses warm gradient colors (orange/red/pink spectrum)
- Logo is self-contained with internal gradients
- Background complements the warm logo colors
- All gradients are defined inline within SVG for portability
