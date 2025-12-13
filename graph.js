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
    },

    'tachyon-beams': {
        name: "Tachyon Beam Splitters (24 nodes)",
        description: "Based on an Advent of Code problem: beams enter at S, move down, and split left/right at each ^ splitter",
        createGraph: function() {
            const graph = new Graph();

            // Grid layout:
            // .......S.......  (row 0)
            // .......^.......  (row 2)
            // ......^.^......  (row 4)
            // .....^.^.^.....  (row 6)
            // ....^.^...^....  (row 8)
            // ...^.^...^.^...  (row 10)
            // ..^...^.....^..  (row 12)
            // .^.^.^.^.^...^.  (row 14)

            const scale = 30;
            const offsetX = 50;
            const offsetY = 50;

            // Node positions based on grid (col, row)
            // Source
            graph.addNode(0, "S", offsetX + 7 * scale, offsetY + 0 * scale);

            // Row 2
            graph.addNode(1, "1", offsetX + 7 * scale, offsetY + 2 * scale);

            // Row 4
            graph.addNode(2, "2", offsetX + 6 * scale, offsetY + 4 * scale);
            graph.addNode(3, "3", offsetX + 8 * scale, offsetY + 4 * scale);

            // Row 6
            graph.addNode(4, "4", offsetX + 5 * scale, offsetY + 6 * scale);
            graph.addNode(5, "5", offsetX + 7 * scale, offsetY + 6 * scale);
            graph.addNode(6, "6", offsetX + 9 * scale, offsetY + 6 * scale);

            // Row 8
            graph.addNode(7, "7", offsetX + 4 * scale, offsetY + 8 * scale);
            graph.addNode(8, "8", offsetX + 6 * scale, offsetY + 8 * scale);
            graph.addNode(9, "9", offsetX + 10 * scale, offsetY + 8 * scale);

            // Row 10
            graph.addNode(10, "10", offsetX + 3 * scale, offsetY + 10 * scale);
            graph.addNode(11, "11", offsetX + 5 * scale, offsetY + 10 * scale);
            graph.addNode(12, "12", offsetX + 9 * scale, offsetY + 10 * scale);
            graph.addNode(13, "13", offsetX + 11 * scale, offsetY + 10 * scale);

            // Row 12
            graph.addNode(14, "14", offsetX + 2 * scale, offsetY + 12 * scale);
            graph.addNode(15, "15", offsetX + 6 * scale, offsetY + 12 * scale);
            graph.addNode(16, "16", offsetX + 12 * scale, offsetY + 12 * scale);

            // Row 14
            graph.addNode(17, "17", offsetX + 1 * scale, offsetY + 14 * scale);
            graph.addNode(18, "18", offsetX + 3 * scale, offsetY + 14 * scale);
            graph.addNode(19, "19", offsetX + 5 * scale, offsetY + 14 * scale);
            graph.addNode(20, "20", offsetX + 7 * scale, offsetY + 14 * scale);
            graph.addNode(21, "21", offsetX + 9 * scale, offsetY + 14 * scale);
            graph.addNode(22, "22", offsetX + 13 * scale, offsetY + 14 * scale);

            // Sink (bottom)
            graph.addNode(23, "T", offsetX + 7 * scale, offsetY + 16 * scale);

            // Add edges based on beam propagation
            // From S (0)
            graph.addEdge(0, 1);

            // From node 1 (row 2, col 7)
            graph.addEdge(1, 2);  // left beam
            graph.addEdge(1, 3);  // right beam

            // From node 2 (row 4, col 6)
            graph.addEdge(2, 4);  // left
            graph.addEdge(2, 5);  // right

            // From node 3 (row 4, col 8)
            graph.addEdge(3, 5);  // left
            graph.addEdge(3, 6);  // right

            // From node 4 (row 6, col 5)
            graph.addEdge(4, 7);  // left
            graph.addEdge(4, 8);  // right

            // From node 5 (row 6, col 7)
            graph.addEdge(5, 8);  // left
            graph.addEdge(5, 23); // right beam exits to sink

            // From node 6 (row 6, col 9)
            graph.addEdge(6, 23); // left beam exits to sink
            graph.addEdge(6, 9);  // right

            // From node 7 (row 8, col 4)
            graph.addEdge(7, 10); // left
            graph.addEdge(7, 11); // right

            // From node 8 (row 8, col 6)
            graph.addEdge(8, 11); // left
            graph.addEdge(8, 23); // right beam exits to sink

            // From node 9 (row 8, col 10)
            graph.addEdge(9, 12); // left
            graph.addEdge(9, 13); // right

            // From node 10 (row 10, col 3)
            graph.addEdge(10, 14); // left
            graph.addEdge(10, 23); // right beam exits to sink

            // From node 11 (row 10, col 5)
            graph.addEdge(11, 23); // left beam exits to sink
            graph.addEdge(11, 15); // right

            // From node 12 (row 10, col 9)
            graph.addEdge(12, 23); // both beams exit to sink
            graph.addEdge(12, 23);

            // From node 13 (row 10, col 11)
            graph.addEdge(13, 23); // left beam exits to sink
            graph.addEdge(13, 16); // right

            // From node 14 (row 12, col 2)
            graph.addEdge(14, 17); // left
            graph.addEdge(14, 18); // right

            // From node 15 (row 12, col 6)
            graph.addEdge(15, 19); // left
            graph.addEdge(15, 20); // right

            // From node 16 (row 12, col 12)
            graph.addEdge(16, 23); // left beam exits to sink
            graph.addEdge(16, 22); // right

            // From node 17 (row 14, col 1) - all exit to sink
            graph.addEdge(17, 23);
            graph.addEdge(17, 23);

            // From node 18 (row 14, col 3) - all exit to sink
            graph.addEdge(18, 23);
            graph.addEdge(18, 23);

            // From node 19 (row 14, col 5) - all exit to sink
            graph.addEdge(19, 23);
            graph.addEdge(19, 23);

            // From node 20 (row 14, col 7) - all exit to sink
            graph.addEdge(20, 23);
            graph.addEdge(20, 23);

            // From node 21 (row 14, col 9) - all exit to sink
            graph.addEdge(21, 23);
            graph.addEdge(21, 23);

            // From node 22 (row 14, col 13) - all exit to sink
            graph.addEdge(22, 23);
            graph.addEdge(22, 23);

            return graph;
        }
    }
};
