from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any, Dict
 
app = FastAPI()
 
# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
 
# ── Request schema ────────────────────────────────────────────────────────────
 
class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
 
 
# ── Helpers ───────────────────────────────────────────────────────────────────
 
def is_dag(nodes: list, edges: list) -> bool:
    """
    Returns True if the graph formed by nodes + edges is a
    Directed Acyclic Graph (DAG), i.e. contains no cycles.
 
    Uses DFS-based cycle detection (Kahn's topological sort approach):
    - Build an adjacency list and in-degree map from edges.
    - Repeatedly remove nodes with in-degree 0.
    - If all nodes are removed, the graph is a DAG.
    - If any nodes remain, there is a cycle → not a DAG.
    """
    node_ids = {node["id"] for node in nodes}
 
    # Build adjacency list and in-degree count
    in_degree = {nid: 0 for nid in node_ids}
    adjacency = {nid: [] for nid in node_ids}
 
    for edge in edges:
        src = edge.get("source")
        tgt = edge.get("target")
        # Only count edges between known nodes
        if src in node_ids and tgt in node_ids:
            adjacency[src].append(tgt)
            in_degree[tgt] += 1
 
    # Kahn's algorithm — start with all zero in-degree nodes
    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    visited_count = 0
 
    while queue:
        node = queue.pop()
        visited_count += 1
        for neighbour in adjacency[node]:
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                queue.append(neighbour)
 
    return visited_count == len(node_ids)
 
 
# ── Routes ────────────────────────────────────────────────────────────────────
 
@app.get('/')
def read_root():
    return {'Ping': 'Pong'}
 
 
@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag = is_dag(pipeline.nodes, pipeline.edges)
 
    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': dag,
    }
