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
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: currentPath,
                        action: 'sink-reached'
                    }, `Reached sink node ${sinkId}`));

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
    },

    'dfs-node-disjoint': {
        name: "DFS - Node-Disjoint Paths",
        description: "Depth-First Search to find node-disjoint paths from source to sink. No two paths share any intermediate nodes (except source and sink). Useful for finding independent routes in network flow problems.",

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
            }, `Starting DFS from node ${sourceId} to find node-disjoint paths to node ${sinkId}`));

            // Track globally used nodes across all found paths
            const globallyUsedNodes = new Set([sourceId, sinkId]);

            // Recursive DFS function
            function dfs(currentId, currentPath, visited) {
                // Check if we reached the sink
                if (currentId === sinkId) {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: currentPath,
                        action: 'sink-reached'
                    }, `Reached sink node ${sinkId}`));

                    const pathCopy = [...currentPath];
                    allPaths.push(pathCopy);

                    steps.push(new AlgorithmStep('path-found', {
                        path: pathCopy,
                        pathIndex: allPaths.length - 1
                    }, `Found node-disjoint path ${allPaths.length}: ${pathCopy.join(' → ')}`));

                    // Mark all nodes in this path (except source and sink) as globally used
                    for (let i = 1; i < pathCopy.length - 1; i++) {
                        globallyUsedNodes.add(pathCopy[i]);
                    }

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
                    // Skip if already visited in current path
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

                    // Skip if used in another found path (except if it's the sink)
                    if (globallyUsedNodes.has(neighborId) && neighborId !== sinkId) {
                        steps.push(new AlgorithmStep('explore-edge', {
                            from: currentId,
                            to: neighborId,
                            path: [...currentPath],
                            skipped: true,
                            reason: 'globally-used'
                        }, `Skipping node ${neighborId} - used in another path`));
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
            }, `Search complete! Found ${allPaths.length} node-disjoint path(s) from ${sourceId} to ${sinkId}`));

            return { steps, paths: allPaths };
        }
    },

    'dfs-memoized': {
        name: "DFS - All Paths (Memoized)",
        description: "Optimized DFS using memoization to cache path results. Once all paths from a node to sink are computed, they're reused on subsequent visits. Finds the same paths as standard DFS but more efficiently.",

        execute: function(graph, sourceId = null, sinkId = null) {
            const steps = [];
            const allPaths = [];
            const memo = new Map(); // Cache: nodeId -> array of paths from that node to sink

            // Auto-detect source and sink if not provided
            if (sourceId === null) {
                const nodesWithIncoming = new Set();
                graph.edges.forEach(edge => nodesWithIncoming.add(edge.to));
                sourceId = graph.nodes.find(n => !nodesWithIncoming.has(n.id))?.id;
            }

            if (sinkId === null) {
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
            }, `Starting memoized DFS from node ${sourceId} to find all paths to node ${sinkId}`));

            // Recursive DFS with memoization
            function dfs(currentId, currentPath) {
                // Check if we reached the sink
                if (currentId === sinkId) {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: currentPath,
                        action: 'sink-reached'
                    }, `Reached sink node ${sinkId}`));

                    return [[sinkId]];
                }

                // Check memo cache
                if (memo.has(currentId)) {
                    const cachedPaths = memo.get(currentId);

                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: currentPath,
                        action: 'cache-hit',
                        cachedPathCount: cachedPaths.length
                    }, `Cache hit! Node ${currentId} has ${cachedPaths.length} cached path(s) to sink - reusing results`));

                    // Return cached paths (they already include currentId)
                    return cachedPaths;
                }

                // Cache miss - need to compute
                steps.push(new AlgorithmStep('visit', {
                    nodeId: currentId,
                    path: currentPath,
                    action: 'explore'
                }, `Cache miss - exploring neighbors of node ${currentId}`));

                const neighbors = graph.getNeighbors(currentId);
                const pathsFromHere = [];

                // Explore each neighbor
                for (const neighborId of neighbors) {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: currentPath,
                        skipped: false
                    }, `Traversing edge ${currentId} → ${neighborId}`));

                    const newPath = [...currentPath, neighborId];
                    const pathsFromNeighbor = dfs(neighborId, newPath);

                    // Combine paths: currentId + each path from neighbor
                    for (const pathFromNeighbor of pathsFromNeighbor) {
                        const fullPath = [currentId, ...pathFromNeighbor];
                        pathsFromHere.push(fullPath);
                    }
                }

                // Cache the results
                memo.set(currentId, pathsFromHere);

                steps.push(new AlgorithmStep('backtrack', {
                    nodeId: currentId,
                    path: currentPath,
                    cachedCount: pathsFromHere.length
                }, `Cached ${pathsFromHere.length} path(s) from node ${currentId} to sink`));

                return pathsFromHere;
            }

            // Start DFS and collect all paths
            const pathsFromSource = dfs(sourceId, [sourceId]);

            // Add found paths to the results
            pathsFromSource.forEach((path, index) => {
                allPaths.push(path);
                steps.push(new AlgorithmStep('path-found', {
                    path: path,
                    pathIndex: index
                }, `Path ${index + 1}: ${path.join(' → ')}`));
            });

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths,
                cacheSize: memo.size
            }, `Search complete! Found ${allPaths.length} path(s) using memoization. Cache contains ${memo.size} entries.`));

            return { steps, paths: allPaths };
        }
    }
};

// Future algorithms can be added here:
// 'bfs-shortest-path': { ... },
// 'dijkstra': { ... },
// 'topological-sort': { ... },
// etc.
