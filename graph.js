// Graph data structure and example DAGs

class Graph {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.adjacencyList = new Map();
    }

    addNode(id, label, x, y) {
        this.nodes.push({ id, label, x, y });
        this.adjacencyList.set(id, []);
    }

    addEdge(from, to) {
        this.edges.push({ from, to });
        if (this.adjacencyList.has(from)) {
            this.adjacencyList.get(from).push(to);
        }
    }

    getNeighbors(nodeId) {
        return this.adjacencyList.get(nodeId) || [];
    }

    getNode(nodeId) {
        return this.nodes.find(n => n.id === nodeId);
    }

    clear() {
        this.nodes = [];
        this.edges = [];
        this.adjacencyList.clear();
    }
}

// Example DAG configurations
const Examples = {
    simple: {
        name: "Simple DAG (10 nodes)",
        description: "A simple directed acyclic graph with clear path structure",
        createGraph: function() {
            const graph = new Graph();

            // Layer 1 (start)
            graph.addNode(0, "0", 100, 100);

            // Layer 2
            graph.addNode(1, "1", 50, 200);
            graph.addNode(2, "2", 150, 200);

            // Layer 3
            graph.addNode(3, "3", 30, 300);
            graph.addNode(4, "4", 100, 300);
            graph.addNode(5, "5", 170, 300);

            // Layer 4
            graph.addNode(6, "6", 50, 400);
            graph.addNode(7, "7", 120, 400);
            graph.addNode(8, "8", 190, 400);

            // Layer 5 (end)
            graph.addNode(9, "9", 120, 500);

            // Add edges
            graph.addEdge(0, 1);
            graph.addEdge(0, 2);

            graph.addEdge(1, 3);
            graph.addEdge(1, 4);

            graph.addEdge(2, 4);
            graph.addEdge(2, 5);

            graph.addEdge(3, 6);
            graph.addEdge(4, 7);
            graph.addEdge(5, 8);

            graph.addEdge(6, 9);
            graph.addEdge(7, 9);
            graph.addEdge(8, 9);

            return graph;
        }
    },

    medium: {
        name: "Medium DAG (20 nodes)",
        description: "A medium-sized DAG with multiple paths and branching",
        createGraph: function() {
            const graph = new Graph();

            // Layer 1 (start)
            graph.addNode(0, "0", 150, 50);

            // Layer 2
            graph.addNode(1, "1", 80, 130);
            graph.addNode(2, "2", 150, 130);
            graph.addNode(3, "3", 220, 130);

            // Layer 3
            graph.addNode(4, "4", 50, 210);
            graph.addNode(5, "5", 110, 210);
            graph.addNode(6, "6", 170, 210);
            graph.addNode(7, "7", 230, 210);
            graph.addNode(8, "8", 290, 210);

            // Layer 4
            graph.addNode(9, "9", 40, 290);
            graph.addNode(10, "10", 100, 290);
            graph.addNode(11, "11", 160, 290);
            graph.addNode(12, "12", 220, 290);
            graph.addNode(13, "13", 280, 290);

            // Layer 5
            graph.addNode(14, "14", 80, 370);
            graph.addNode(15, "15", 160, 370);
            graph.addNode(16, "16", 240, 370);

            // Layer 6
            graph.addNode(17, "17", 100, 450);
            graph.addNode(18, "18", 200, 450);

            // Layer 7 (end)
            graph.addNode(19, "19", 150, 530);

            // Add edges - Layer 1 to 2
            graph.addEdge(0, 1);
            graph.addEdge(0, 2);
            graph.addEdge(0, 3);

            // Layer 2 to 3
            graph.addEdge(1, 4);
            graph.addEdge(1, 5);
            graph.addEdge(2, 5);
            graph.addEdge(2, 6);
            graph.addEdge(2, 7);
            graph.addEdge(3, 7);
            graph.addEdge(3, 8);

            // Layer 3 to 4
            graph.addEdge(4, 9);
            graph.addEdge(5, 10);
            graph.addEdge(6, 11);
            graph.addEdge(7, 12);
            graph.addEdge(8, 13);

            // Layer 4 to 5
            graph.addEdge(9, 14);
            graph.addEdge(10, 14);
            graph.addEdge(10, 15);
            graph.addEdge(11, 15);
            graph.addEdge(12, 15);
            graph.addEdge(12, 16);
            graph.addEdge(13, 16);

            // Layer 5 to 6
            graph.addEdge(14, 17);
            graph.addEdge(15, 17);
            graph.addEdge(15, 18);
            graph.addEdge(16, 18);

            // Layer 6 to 7
            graph.addEdge(17, 19);
            graph.addEdge(18, 19);

            return graph;
        }
    },

    complex: {
        name: "Complex DAG (20 nodes)",
        description: "A complex DAG with intricate path relationships",
        createGraph: function() {
            const graph = new Graph();

            // Create a more complex structure
            // Layer 1
            graph.addNode(0, "S", 200, 50);

            // Layer 2
            graph.addNode(1, "A", 100, 140);
            graph.addNode(2, "B", 200, 140);
            graph.addNode(3, "C", 300, 140);

            // Layer 3
            graph.addNode(4, "D", 60, 230);
            graph.addNode(5, "E", 140, 230);
            graph.addNode(6, "F", 220, 230);
            graph.addNode(7, "G", 300, 230);
            graph.addNode(8, "H", 380, 230);

            // Layer 4
            graph.addNode(9, "I", 80, 320);
            graph.addNode(10, "J", 160, 320);
            graph.addNode(11, "K", 240, 320);
            graph.addNode(12, "L", 320, 320);

            // Layer 5
            graph.addNode(13, "M", 100, 410);
            graph.addNode(14, "N", 200, 410);
            graph.addNode(15, "O", 300, 410);

            // Layer 6
            graph.addNode(16, "P", 120, 500);
            graph.addNode(17, "Q", 220, 500);
            graph.addNode(18, "R", 320, 500);

            // Layer 7
            graph.addNode(19, "T", 220, 590);

            // Add edges with complex relationships
            graph.addEdge(0, 1);
            graph.addEdge(0, 2);
            graph.addEdge(0, 3);

            graph.addEdge(1, 4);
            graph.addEdge(1, 5);
            graph.addEdge(2, 5);
            graph.addEdge(2, 6);
            graph.addEdge(2, 7);
            graph.addEdge(3, 7);
            graph.addEdge(3, 8);

            graph.addEdge(4, 9);
            graph.addEdge(5, 9);
            graph.addEdge(5, 10);
            graph.addEdge(6, 10);
            graph.addEdge(6, 11);
            graph.addEdge(7, 11);
            graph.addEdge(7, 12);
            graph.addEdge(8, 12);

            graph.addEdge(9, 13);
            graph.addEdge(10, 13);
            graph.addEdge(10, 14);
            graph.addEdge(11, 14);
            graph.addEdge(11, 15);
            graph.addEdge(12, 15);

            graph.addEdge(13, 16);
            graph.addEdge(14, 16);
            graph.addEdge(14, 17);
            graph.addEdge(15, 17);
            graph.addEdge(15, 18);

            graph.addEdge(16, 19);
            graph.addEdge(17, 19);
            graph.addEdge(18, 19);

            return graph;
        }
    },

    'node-disjoint': {
        name: "Node-Disjoint DAG (20 nodes)",
        description: "A DAG with completely separate parallel paths - no intermediate nodes are shared between paths",
        createGraph: function() {
            const graph = new Graph();

            // Source
            graph.addNode(0, "0", 200, 50);

            // Path 1: 0 → 1 → 2 → 3 → 4 → 17 → 19 (5 intermediate nodes)
            graph.addNode(1, "1", 80, 130);
            graph.addNode(2, "2", 80, 210);
            graph.addNode(3, "3", 80, 290);
            graph.addNode(4, "4", 80, 370);
            graph.addNode(17, "17", 120, 450);

            // Path 2: 0 → 5 → 6 → 7 → 8 → 18 → 19 (5 intermediate nodes)
            graph.addNode(5, "5", 160, 130);
            graph.addNode(6, "6", 160, 210);
            graph.addNode(7, "7", 160, 290);
            graph.addNode(8, "8", 160, 370);
            graph.addNode(18, "18", 180, 450);

            // Path 3: 0 → 9 → 10 → 11 → 12 → 19 (4 intermediate nodes)
            graph.addNode(9, "9", 240, 130);
            graph.addNode(10, "10", 240, 210);
            graph.addNode(11, "11", 240, 290);
            graph.addNode(12, "12", 240, 370);

            // Path 4: 0 → 13 → 14 → 15 → 16 → 19 (4 intermediate nodes)
            graph.addNode(13, "13", 320, 130);
            graph.addNode(14, "14", 320, 210);
            graph.addNode(15, "15", 320, 290);
            graph.addNode(16, "16", 320, 370);

            // Sink
            graph.addNode(19, "19", 200, 530);

            // Add edges for Path 1
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(2, 3);
            graph.addEdge(3, 4);
            graph.addEdge(4, 17);
            graph.addEdge(17, 19);

            // Add edges for Path 2
            graph.addEdge(0, 5);
            graph.addEdge(5, 6);
            graph.addEdge(6, 7);
            graph.addEdge(7, 8);
            graph.addEdge(8, 18);
            graph.addEdge(18, 19);

            // Add edges for Path 3
            graph.addEdge(0, 9);
            graph.addEdge(9, 10);
            graph.addEdge(10, 11);
            graph.addEdge(11, 12);
            graph.addEdge(12, 19);

            // Add edges for Path 4
            graph.addEdge(0, 13);
            graph.addEdge(13, 14);
            graph.addEdge(14, 15);
            graph.addEdge(15, 16);
            graph.addEdge(16, 19);

            return graph;
        }
    }
};
