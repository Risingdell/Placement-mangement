# Styles Folder Structure

This folder contains all the CSS styles for the application, organized for better maintainability.

## Folder Structure

```
styles/
├── index.css              # Main entry point - imports all styles
├── base.css               # Tailwind CSS base imports
├── variables.css          # CSS custom properties/variables
├── scrollbar.css          # Custom scrollbar styles
├── animations.css         # Animation utilities and keyframes
└── components/            # Component-specific styles
    ├── auth.css           # Authentication components
    └── dashboard.css      # Dashboard components
```

## Import Order

The import order in `index.css` matters:

1. **base.css** - Tailwind base styles first
2. **variables.css** - CSS variables for reusability
3. **scrollbar.css** - Custom scrollbar utilities
4. **animations.css** - Animation utilities
5. **components/** - Component-specific styles

## Usage

### In your main entry file (main.jsx):
```javascript
import './index.css'
```

### Adding New Component Styles

1. Create a new CSS file in `styles/components/`:
   ```bash
   touch src/styles/components/profile.css
   ```

2. Add your component-specific styles:
   ```css
   /* Profile component styles */
   .profile-card {
     /* styles here */
   }
   ```

3. Import it in `styles/index.css`:
   ```css
   @import './components/profile.css';
   ```

### Using CSS Variables

CSS variables are defined in `variables.css` and can be used anywhere:

```css
.my-button {
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
}
```

### Adding Custom Animations

Add new animations in `animations.css`:

```css
@layer utilities {
  .my-custom-animation {
    animation: myAnimation 1s ease-in-out;
  }
}

@keyframes myAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Best Practices

1. **Keep it organized** - Put component-specific styles in the `components/` folder
2. **Use Tailwind first** - Only create custom CSS when Tailwind doesn't cover your needs
3. **Use CSS variables** - For values used multiple times across components
4. **Name classes semantically** - Use descriptive class names that explain purpose
5. **Document complex styles** - Add comments for complex CSS logic

## Tailwind vs Custom CSS

- **Use Tailwind** for utility classes in JSX (margin, padding, colors, etc.)
- **Use Custom CSS** for:
  - Complex animations
  - Component-specific styles used multiple times
  - Styles that can't be easily expressed with Tailwind
  - Global utilities not provided by Tailwind
