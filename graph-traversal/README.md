# Algorithm Visualizations

An interactive browser-based visualization tool for graph algorithms, starting with Depth-First Search (DFS) on Directed Acyclic Graphs (DAGs).

## Features

- **Interactive Visualization**: Watch algorithms execute step-by-step with animated node and edge highlighting
- **Multiple Examples**: Choose from different DAG configurations (Simple, Medium, Complex)
- **Algorithm Selection**: Extensible architecture to support multiple algorithms (currently DFS for all paths)
- **Speed Control**: Adjust animation speed (Slow, Medium, Fast)
- **Step-by-Step Mode**: Execute algorithms one step at a time for detailed analysis
- **Real-time Statistics**: Track nodes visited, current path, and paths found
- **Path Display**: View all discovered paths with visual highlighting

## Current Algorithm

### DFS - All Paths (No Shared Nodes)

Finds all node-disjoint paths from source to sink in a DAG. No two paths share any intermediate nodes, though they can share the source and sink nodes.

**Use Cases:**
- Network flow analysis
- Finding independent routes
- Resource allocation problems
- Fault-tolerant path planning

## Getting Started

Simply open `index.html` in a modern web browser. No build process or dependencies required!

```bash
# Open in your default browser (macOS)
open index.html

# Open in your default browser (Linux)
xdg-open index.html

# Open in your default browser (Windows)
start index.html
```

Or use a local web server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server
```

Then navigate to `http://localhost:8000`

## How to Use

1. **Select an Algorithm**: Choose from the algorithm dropdown (currently DFS)
2. **Select an Example**: Pick a DAG configuration (Simple, Medium, or Complex)
3. **Choose Speed**: Set animation speed for automatic playback
4. **Start**: Click "Start" to begin automatic animation
5. **Step**: Click "Step" to execute one step at a time
6. **Pause/Resume**: Pause and resume automatic playback
7. **Reset**: Reset visualization to start over

## Project Structure

```
algorithm-visualisations/
├── index.html          # Main HTML structure
├── styles.css          # Styling and animations
├── graph.js            # Graph data structure and example DAGs
├── algorithms.js       # Algorithm implementations
├── visualizer.js       # SVG rendering and animation controller
├── main.js             # Application logic and UI coordination
└── README.md           # This file
```

## Architecture

The application is built with a modular architecture:

- **Graph**: Data structure for representing DAGs with nodes and edges
- **Examples**: Pre-configured DAG examples with different complexity levels
- **Algorithms**: Strategy pattern for different algorithm implementations
- **GraphVisualizer**: SVG-based rendering engine
- **AnimationController**: Manages step-by-step animation playback
- **AlgorithmVisualizerApp**: Main application controller

## Adding New Algorithms

To add a new algorithm:

1. Add entry to `Algorithms` object in `algorithms.js`:
```javascript
'algorithm-id': {
    name: "Algorithm Name",
    description: "Algorithm description",
    execute: function(graph, ...params) {
        const steps = [];
        // Implementation using AlgorithmStep objects
        return { steps, paths: [] };
    }
}
```

2. Add option to algorithm select in `index.html`:
```html
<option value="algorithm-id">Algorithm Name</option>
```

## Adding New Examples

To add a new example DAG:

1. Add entry to `Examples` object in `graph.js`:
```javascript
'example-id': {
    name: "Example Name",
    description: "Example description",
    createGraph: function() {
        const graph = new Graph();
        // Add nodes and edges
        return graph;
    }
}
```

2. Add option to example select in `index.html`:
```html
<option value="example-id">Example Name</option>
```

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- SVG 1.1
- CSS3 animations

Tested in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- Additional algorithms (BFS, Dijkstra, Topological Sort, etc.)
- Custom graph creation interface
- Export/import graph configurations
- Performance metrics and complexity analysis
- Graph layout algorithms for better visualization
- Touch support for mobile devices
- Dark mode

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Some areas for improvement:
- New algorithm implementations
- Better graph layouts
- Additional visualization features
- Performance optimizations
- Test coverage
