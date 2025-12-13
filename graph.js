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

class GraphBuilder {
    constructor() {
        this.graph = new Graph();
    }

    addLayerOfNodes(nodeConfigs) {
        nodeConfigs.forEach(({ id, label, x, y }) => {
            this.graph.addNode(id, label, x, y);
        });
        return this;
    }

    connectSequentially(nodeIds) {
        for (let i = 0; i < nodeIds.length - 1; i++) {
            this.graph.addEdge(nodeIds[i], nodeIds[i + 1]);
        }
        return this;
    }

    connectOneToMany(fromId, toIds) {
        toIds.forEach(toId => this.graph.addEdge(fromId, toId));
        return this;
    }

    connectManyToOne(fromIds, toId) {
        fromIds.forEach(fromId => this.graph.addEdge(fromId, toId));
        return this;
    }

    build() {
        return this.graph;
    }
}

const Examples = {
    simple: {
        name: "Simple DAG (10 nodes)",
        description: "A simple directed acyclic graph with clear path structure",
        createGraph: function() {
            const builder = new GraphBuilder();

            builder.addLayerOfNodes([
                { id: 0, label: "0", x: 100, y: 100 }
            ]);

            builder.addLayerOfNodes([
                { id: 1, label: "1", x: 50, y: 200 },
                { id: 2, label: "2", x: 150, y: 200 }
            ]);

            builder.addLayerOfNodes([
                { id: 3, label: "3", x: 30, y: 300 },
                { id: 4, label: "4", x: 100, y: 300 },
                { id: 5, label: "5", x: 170, y: 300 }
            ]);

            builder.addLayerOfNodes([
                { id: 6, label: "6", x: 50, y: 400 },
                { id: 7, label: "7", x: 120, y: 400 },
                { id: 8, label: "8", x: 190, y: 400 }
            ]);

            builder.addLayerOfNodes([
                { id: 9, label: "9", x: 120, y: 500 }
            ]);

            builder.connectOneToMany(0, [1, 2]);
            builder.connectOneToMany(1, [3, 4]);
            builder.connectOneToMany(2, [4, 5]);
            builder.graph.addEdge(3, 6);
            builder.graph.addEdge(4, 7);
            builder.graph.addEdge(5, 8);
            builder.connectManyToOne([6, 7, 8], 9);

            return builder.build();
        }
    },

    medium: {
        name: "Medium DAG (20 nodes)",
        description: "A medium-sized DAG with multiple paths and branching",
        createGraph: function() {
            const builder = new GraphBuilder();

            builder.addLayerOfNodes([{ id: 0, label: "0", x: 150, y: 50 }]);

            builder.addLayerOfNodes([
                { id: 1, label: "1", x: 80, y: 130 },
                { id: 2, label: "2", x: 150, y: 130 },
                { id: 3, label: "3", x: 220, y: 130 }
            ]);

            builder.addLayerOfNodes([
                { id: 4, label: "4", x: 50, y: 210 },
                { id: 5, label: "5", x: 110, y: 210 },
                { id: 6, label: "6", x: 170, y: 210 },
                { id: 7, label: "7", x: 230, y: 210 },
                { id: 8, label: "8", x: 290, y: 210 }
            ]);

            builder.addLayerOfNodes([
                { id: 9, label: "9", x: 40, y: 290 },
                { id: 10, label: "10", x: 100, y: 290 },
                { id: 11, label: "11", x: 160, y: 290 },
                { id: 12, label: "12", x: 220, y: 290 },
                { id: 13, label: "13", x: 280, y: 290 }
            ]);

            builder.addLayerOfNodes([
                { id: 14, label: "14", x: 80, y: 370 },
                { id: 15, label: "15", x: 160, y: 370 },
                { id: 16, label: "16", x: 240, y: 370 }
            ]);

            builder.addLayerOfNodes([
                { id: 17, label: "17", x: 100, y: 450 },
                { id: 18, label: "18", x: 200, y: 450 }
            ]);

            builder.addLayerOfNodes([{ id: 19, label: "19", x: 150, y: 530 }]);

            builder.connectOneToMany(0, [1, 2, 3]);
            builder.graph.addEdge(1, 4);
            builder.connectOneToMany(1, [4, 5]);
            builder.connectOneToMany(2, [5, 6, 7]);
            builder.connectOneToMany(3, [7, 8]);
            builder.graph.addEdge(4, 9);
            builder.graph.addEdge(5, 10);
            builder.graph.addEdge(6, 11);
            builder.graph.addEdge(7, 12);
            builder.graph.addEdge(8, 13);
            builder.connectManyToOne([9, 10], 14);
            builder.connectManyToOne([10, 11, 12], 15);
            builder.connectManyToOne([12, 13], 16);
            builder.connectManyToOne([14, 15], 17);
            builder.connectManyToOne([15, 16], 18);
            builder.connectManyToOne([17, 18], 19);

            return builder.build();
        }
    },

    complex: {
        name: "Complex DAG (20 nodes)",
        description: "A complex DAG with intricate path relationships",
        createGraph: function() {
            const builder = new GraphBuilder();

            builder.addLayerOfNodes([{ id: 0, label: "S", x: 200, y: 50 }]);

            builder.addLayerOfNodes([
                { id: 1, label: "A", x: 100, y: 140 },
                { id: 2, label: "B", x: 200, y: 140 },
                { id: 3, label: "C", x: 300, y: 140 }
            ]);

            builder.addLayerOfNodes([
                { id: 4, label: "D", x: 60, y: 230 },
                { id: 5, label: "E", x: 140, y: 230 },
                { id: 6, label: "F", x: 220, y: 230 },
                { id: 7, label: "G", x: 300, y: 230 },
                { id: 8, label: "H", x: 380, y: 230 }
            ]);

            builder.addLayerOfNodes([
                { id: 9, label: "I", x: 80, y: 320 },
                { id: 10, label: "J", x: 160, y: 320 },
                { id: 11, label: "K", x: 240, y: 320 },
                { id: 12, label: "L", x: 320, y: 320 }
            ]);

            builder.addLayerOfNodes([
                { id: 13, label: "M", x: 100, y: 410 },
                { id: 14, label: "N", x: 200, y: 410 },
                { id: 15, label: "O", x: 300, y: 410 }
            ]);

            builder.addLayerOfNodes([
                { id: 16, label: "P", x: 120, y: 500 },
                { id: 17, label: "Q", x: 220, y: 500 },
                { id: 18, label: "R", x: 320, y: 500 }
            ]);

            builder.addLayerOfNodes([{ id: 19, label: "T", x: 220, y: 590 }]);

            builder.connectOneToMany(0, [1, 2, 3]);
            builder.connectOneToMany(1, [4, 5]);
            builder.connectOneToMany(2, [5, 6, 7]);
            builder.connectOneToMany(3, [7, 8]);
            builder.connectManyToOne([4, 5], 9);
            builder.connectManyToOne([5, 6], 10);
            builder.connectManyToOne([6, 7], 11);
            builder.connectManyToOne([7, 8], 12);
            builder.connectManyToOne([9, 10], 13);
            builder.connectManyToOne([10, 11], 14);
            builder.connectManyToOne([11, 12], 15);
            builder.connectManyToOne([13, 14], 16);
            builder.connectManyToOne([14, 15], 17);
            builder.graph.addEdge(15, 18);
            builder.connectManyToOne([16, 17, 18], 19);

            return builder.build();
        }
    },

    'node-disjoint': {
        name: "Node-Disjoint DAG (20 nodes)",
        description: "A DAG with completely separate parallel paths - no intermediate nodes are shared between paths",
        createGraph: function() {
            const builder = new GraphBuilder();

            builder.graph.addNode(0, "0", 200, 50);

            builder.connectSequentially([0, 1, 2, 3, 4, 17, 19]);
            builder.graph.addNode(1, "1", 80, 130);
            builder.graph.addNode(2, "2", 80, 210);
            builder.graph.addNode(3, "3", 80, 290);
            builder.graph.addNode(4, "4", 80, 370);
            builder.graph.addNode(17, "17", 120, 450);

            builder.connectSequentially([0, 5, 6, 7, 8, 18, 19]);
            builder.graph.addNode(5, "5", 160, 130);
            builder.graph.addNode(6, "6", 160, 210);
            builder.graph.addNode(7, "7", 160, 290);
            builder.graph.addNode(8, "8", 160, 370);
            builder.graph.addNode(18, "18", 180, 450);

            builder.connectSequentially([0, 9, 10, 11, 12, 19]);
            builder.graph.addNode(9, "9", 240, 130);
            builder.graph.addNode(10, "10", 240, 210);
            builder.graph.addNode(11, "11", 240, 290);
            builder.graph.addNode(12, "12", 240, 370);

            builder.connectSequentially([0, 13, 14, 15, 16, 19]);
            builder.graph.addNode(13, "13", 320, 130);
            builder.graph.addNode(14, "14", 320, 210);
            builder.graph.addNode(15, "15", 320, 290);
            builder.graph.addNode(16, "16", 320, 370);

            builder.graph.addNode(19, "19", 200, 530);

            return builder.build();
        }
    },

    'tachyon-beams': {
        name: "Tachyon Beam Splitters (24 nodes)",
        description: "Based on an Advent of Code problem: beams enter at S, move down, and split left/right at each ^ splitter",
        createGraph: function() {
            const builder = new GraphBuilder();

            const scale = 30;
            const offsetX = 50;
            const offsetY = 50;

            const position = (col, row) => ({
                x: offsetX + col * scale,
                y: offsetY + row * scale
            });

            builder.graph.addNode(0, "S", ...Object.values(position(7, 0)));

            builder.graph.addNode(1, "1", ...Object.values(position(7, 2)));
            builder.graph.addNode(2, "2", ...Object.values(position(6, 4)));
            builder.graph.addNode(3, "3", ...Object.values(position(8, 4)));
            builder.graph.addNode(4, "4", ...Object.values(position(5, 6)));
            builder.graph.addNode(5, "5", ...Object.values(position(7, 6)));
            builder.graph.addNode(6, "6", ...Object.values(position(9, 6)));
            builder.graph.addNode(7, "7", ...Object.values(position(4, 8)));
            builder.graph.addNode(8, "8", ...Object.values(position(6, 8)));
            builder.graph.addNode(9, "9", ...Object.values(position(10, 8)));
            builder.graph.addNode(10, "10", ...Object.values(position(3, 10)));
            builder.graph.addNode(11, "11", ...Object.values(position(5, 10)));
            builder.graph.addNode(12, "12", ...Object.values(position(9, 10)));
            builder.graph.addNode(13, "13", ...Object.values(position(11, 10)));
            builder.graph.addNode(14, "14", ...Object.values(position(2, 12)));
            builder.graph.addNode(15, "15", ...Object.values(position(6, 12)));
            builder.graph.addNode(16, "16", ...Object.values(position(12, 12)));
            builder.graph.addNode(17, "17", ...Object.values(position(1, 14)));
            builder.graph.addNode(18, "18", ...Object.values(position(3, 14)));
            builder.graph.addNode(19, "19", ...Object.values(position(5, 14)));
            builder.graph.addNode(20, "20", ...Object.values(position(7, 14)));
            builder.graph.addNode(21, "21", ...Object.values(position(9, 14)));
            builder.graph.addNode(22, "22", ...Object.values(position(13, 14)));
            builder.graph.addNode(23, "T", ...Object.values(position(7, 16)));

            builder.graph.addEdge(0, 1);
            builder.connectOneToMany(1, [2, 3]);
            builder.connectOneToMany(2, [4, 5]);
            builder.connectOneToMany(3, [5, 6]);
            builder.connectOneToMany(4, [7, 8]);
            builder.connectOneToMany(5, [8, 23]);
            builder.connectOneToMany(6, [23, 9]);
            builder.connectOneToMany(7, [10, 11]);
            builder.connectOneToMany(8, [11, 23]);
            builder.connectOneToMany(9, [12, 13]);
            builder.connectOneToMany(10, [14, 23]);
            builder.connectOneToMany(11, [23, 15]);
            builder.connectOneToMany(12, [23, 23]);
            builder.connectOneToMany(13, [23, 16]);
            builder.connectOneToMany(14, [17, 18]);
            builder.connectOneToMany(15, [19, 20]);
            builder.connectOneToMany(16, [23, 22]);
            builder.connectManyToOne([17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22], 23);

            return builder.build();
        }
    }
};
