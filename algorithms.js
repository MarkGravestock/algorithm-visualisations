// Algorithm implementations with step-by-step tracking

class AlgorithmStep {
    constructor(type, data, description) {
        this.type = type;  // 'visit', 'backtrack', 'path-found', 'explore-edge', 'complete'
        this.data = data;
        this.description = description;
    }
}

const Algorithms = {
    'dfs-all-paths': {
        name: "DFS - All Paths",
        description: "Depth-First Search to find all possible paths from source to sink in a directed acyclic graph. Explores every possible route through the graph.",

        execute: function(graph, sourceId = null, sinkId = null) {
            const steps = [];
            const allPaths = [];

            // Auto-detect source and sink if not provided
            if (sourceId === null) {
                // Source is a node with no incoming edges
                const nodesWithIncoming = new Set();
                graph.edges.forEach(edge => nodesWithIncoming.add(edge.to));
                sourceId = graph.nodes.find(n => !nodesWithIncoming.has(n.id))?.id;
            }

            if (sinkId === null) {
                // Sink is a node with no outgoing edges
                sinkId = graph.nodes.find(n =>
                    graph.getNeighbors(n.id).length === 0
                )?.id;
            }

            if (sourceId === undefined || sinkId === undefined) {
                steps.push(new AlgorithmStep('complete', {},
                    'Error: Could not identify source or sink node'));
                return { steps, paths: allPaths };
            }

            steps.push(new AlgorithmStep('visit', {
                nodeId: sourceId,
                path: [sourceId],
                action: 'start'
            }, `Starting DFS from node ${sourceId} to find all paths to node ${sinkId}`));

            // Recursive DFS function
            function dfs(currentId, currentPath, visited) {
                // Check if we reached the sink
                if (currentId === sinkId) {
                    const pathCopy = [...currentPath];
                    allPaths.push(pathCopy);

                    steps.push(new AlgorithmStep('path-found', {
                        path: pathCopy,
                        pathIndex: allPaths.length - 1
                    }, `Found complete path ${allPaths.length}: ${pathCopy.join(' → ')}`));

                    return;
                }

                // Get neighbors
                const neighbors = graph.getNeighbors(currentId);

                steps.push(new AlgorithmStep('visit', {
                    nodeId: currentId,
                    path: [...currentPath],
                    neighbors: neighbors,
                    action: 'explore'
                }, `Exploring neighbors of node ${currentId}: [${neighbors.join(', ')}]`));

                // Explore each neighbor
                for (const neighborId of neighbors) {
                    // Skip if already visited in current path (prevents cycles)
                    if (visited.has(neighborId)) {
                        steps.push(new AlgorithmStep('explore-edge', {
                            from: currentId,
                            to: neighborId,
                            path: [...currentPath],
                            skipped: true,
                            reason: 'in-current-path'
                        }, `Skipping node ${neighborId} - already in current path`));
                        continue;
                    }

                    // Explore this neighbor
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: [...currentPath],
                        skipped: false
                    }, `Traversing edge ${currentId} → ${neighborId}`));

                    const newPath = [...currentPath, neighborId];
                    const newVisited = new Set(visited);
                    newVisited.add(neighborId);

                    dfs(neighborId, newPath, newVisited);
                }

                // Backtrack
                if (currentId !== sourceId) {
                    steps.push(new AlgorithmStep('backtrack', {
                        nodeId: currentId,
                        path: [...currentPath]
                    }, `Backtracking from node ${currentId}`));
                }
            }

            // Start DFS
            const initialVisited = new Set([sourceId]);
            dfs(sourceId, [sourceId], initialVisited);

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths
            }, `Search complete! Found ${allPaths.length} path(s) from ${sourceId} to ${sinkId}`));

            return { steps, paths: allPaths };
        }
    }
};

// Future algorithms can be added here:
// 'bfs-shortest-path': { ... },
// 'dijkstra': { ... },
// 'topological-sort': { ... },
// etc.
