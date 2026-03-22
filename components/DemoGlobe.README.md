# DemoGlobe Component

A stunning 3D interactive globe component for MapMyVisitors landing page, built with globe.gl and React.

## Features

### Visual Excellence
- **Realistic Earth**: Blue Marble NASA texture with 3D terrain topology
- **Space Background**: Dark starfield for immersive space view
- **Atmospheric Glow**: Blue halo effect around Earth
- **Pulsing Visitors**: Recent visitors shown with animated blue dots
- **Static History**: Older visitors displayed as gray dots

### Interactivity
- **Auto-Rotation**: Smooth 15-second rotation cycle
- **Drag to Rotate**: Click and drag (or touch drag) to manually rotate
- **Scroll to Zoom**: Zoom in/out with mouse wheel or pinch gestures
- **Hover Labels**: City and country information on hover
- **Smart Pause**: Auto-rotation pauses during interaction, resumes after 3 seconds

### Performance
- **60 FPS**: Smooth animations on modern devices
- **Lazy Loading**: globe.gl library loaded from CDN only when needed
- **Reduced Motion**: Respects user's motion preferences
- **Mobile Optimized**: Touch controls and responsive sizing
- **Error Handling**: Graceful fallback for unsupported browsers

## Demo Data

The component includes 25+ hardcoded visitor points across all continents:

**Recent Visitors (8 pulsing blue dots):**
- San Francisco, US
- London, UK
- Tokyo, Japan
- Sydney, Australia
- Berlin, Germany
- Singapore
- Toronto, Canada
- São Paulo, Brazil

**Historical Visitors (17 static gray dots):**
- New York, Paris, Mumbai, Dubai, Moscow, Lagos, Mexico City, Seoul, Buenos Aires, Cairo, Bangkok, Istanbul, Nairobi, Stockholm, Melbourne, Hong Kong, Montreal

## Usage

```tsx
import DemoGlobe from '@/components/DemoGlobe';

export default function LandingPage() {
  return (
    <div className="container">
      <DemoGlobe />
    </div>
  );
}
```

## Demo Page

Visit `/demo` to see the globe in action with a complete landing page layout.

## Technical Details

### Dependencies
- **globe.gl**: 2.27.2 (loaded from CDN)
- **React**: 18.3.1
- **TypeScript**: Full type safety

### Textures (from unpkg.com)
- Earth texture: `earth-blue-marble.jpg`
- Bump map: `earth-topology.png`
- Background: `night-sky.png`

### Configuration
- **Globe Size**: 600x600px on desktop, responsive on mobile
- **Rotation Speed**: 0.5 (slow, elegant)
- **Initial View**: Atlantic Ocean (lat: 20°, lng: -30°)
- **Camera Altitude**: 2.5 (optimal viewing distance)
- **Zoom Range**: 1.5x to 5x
- **Atmosphere**: Blue (#3b82f6) at 0.15 altitude

### Browser Support
- Chrome, Firefox, Safari, Edge (latest versions)
- Requires WebGL support
- Graceful fallback for unsupported browsers

## Accessibility

- **aria-hidden**: Globe marked as decorative
- **Reduced Motion**: Animations disabled for users who prefer reduced motion
- **Keyboard**: Not keyboard-navigable (purely visual demo)
- **Screen Readers**: Descriptive label provided

## Mobile Responsiveness

| Screen Size | Globe Size | Touch Controls |
|-------------|------------|----------------|
| < 640px | 100% width, 400px height | Single finger drag, pinch zoom |
| 640-1024px | 100% width, 500px height | Single finger drag, pinch zoom |
| > 1024px | 600x600px | Mouse drag, scroll zoom |

## Error Handling

1. **WebGL Check**: Tests browser support before initialization
2. **Library Loading**: Catches CDN failures and shows fallback
3. **Texture Loading**: Retries on failure
4. **Cleanup**: Properly disposes resources on unmount

## Performance Optimizations

- **Debounced Resize**: Window resize events throttled to 100ms
- **RAF Animation**: Uses requestAnimationFrame for smooth pulse effect
- **Cleanup on Unmount**: Removes listeners and cancels animations
- **Conditional Rendering**: Loading state prevents premature rendering

## Customization

To modify the globe, edit these values in `DemoGlobe.tsx`:

```typescript
// Change rotation speed
controls.autoRotateSpeed = 0.5; // 0.5 = slow, 2.0 = fast

// Adjust atmosphere color
.atmosphereColor('#3b82f6') // Change to your brand color

// Modify point sizes
size: 0.4 // Recent visitors
size: 0.2 // Older visitors

// Change initial view
globe.pointOfView({
  lat: 20,    // Latitude
  lng: -30,   // Longitude
  altitude: 2.5 // Distance
}, 0);
```

## License

This component is part of the MapMyVisitors project.

## Support

For issues or questions, please refer to the main project documentation.
