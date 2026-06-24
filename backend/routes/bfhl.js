const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({
      error: "data must be an array"
    });
  }

  const invalid_entries = [];

  const duplicate_edges = [];

  const edgeSet = new Set();

  const childParent = {};

  const adjacency = {};

  const validEdges = [];

  for (let item of data) {
    item = String(item).trim();

    if (!/^[A-Z]->[A-Z]$/.test(item)) {
      invalid_entries.push(item);
      continue;
    }

    const [parent, child] = item.split("->");

    if (parent === child) {
      invalid_entries.push(item);
      continue;
    }

    if (edgeSet.has(item)) {
      if (!duplicate_edges.includes(item)) {
        duplicate_edges.push(item);
      }
      continue;
    }

    edgeSet.add(item);

    if (childParent[child]) {
      continue;
    }

    childParent[child] = parent;

    validEdges.push([parent, child]);

    if (!adjacency[parent]) adjacency[parent] = [];

    adjacency[parent].push(child);

    if (!adjacency[child]) adjacency[child] = [];
  }

  const nodes = new Set();

  validEdges.forEach(([p, c]) => {
    nodes.add(p);
    nodes.add(c);
  });

  const visitedGlobal = new Set();

  const hierarchies = [];

  let total_trees = 0;
  let total_cycles = 0;

  let largestDepth = -1;
  let largestTreeRoot = "";

  const allNodes = [...nodes];

  const undirected = {};

  allNodes.forEach((n) => (undirected[n] = []));

  validEdges.forEach(([p, c]) => {
    undirected[p].push(c);
    undirected[c].push(p);
  });

  const components = [];

  for (const node of allNodes) {
    if (visitedGlobal.has(node)) continue;

    const stack = [node];

    const component = [];

    visitedGlobal.add(node);

    while (stack.length) {
      const curr = stack.pop();

      component.push(curr);

      for (const neigh of undirected[curr]) {
        if (!visitedGlobal.has(neigh)) {
          visitedGlobal.add(neigh);
          stack.push(neigh);
        }
      }
    }

    components.push(component);
  }

  function detectCycle(node, visiting, visited) {
    if (visiting.has(node)) return true;

    if (visited.has(node)) return false;

    visiting.add(node);

    for (const child of adjacency[node] || []) {
      if (detectCycle(child, visiting, visited)) {
        return true;
      }
    }

    visiting.delete(node);

    visited.add(node);

    return false;
  }

  function buildTree(node) {
    const obj = {};

    for (const child of adjacency[node] || []) {
      obj[child] = buildTree(child);
    }

    return obj;
  }

  function depth(node) {
    if ((adjacency[node] || []).length === 0) {
      return 1;
    }

    let max = 0;

    for (const child of adjacency[node]) {
      max = Math.max(max, depth(child));
    }

    return max + 1;
  }

  for (const component of components) {
    let root = component.find((n) => !childParent[n]);

    if (!root) {
      root = [...component].sort()[0];
    }

    const cycle = detectCycle(
      root,
      new Set(),
      new Set()
    );

    if (cycle) {
      total_cycles++;

      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });

      continue;
    }

    total_trees++;

    const treeObj = {};

    treeObj[root] = buildTree(root);

    const d = depth(root);

    if (
      d > largestDepth ||
      (d === largestDepth &&
        root < largestTreeRoot)
    ) {
      largestDepth = d;
      largestTreeRoot = root;
    }

    hierarchies.push({
      root,
      tree: treeObj,
      depth: d
    });
  }

  return res.json({
    user_id: "arnavanand",
    email_id: "arnav0198.be23@chitkara.edu.in",
    college_roll_number: "2310990198",

    hierarchies,

    invalid_entries,

    duplicate_edges,

    summary: {
      total_trees,
      total_cycles,
      largest_tree_root:
        largestTreeRoot || ""
    }
  });
});

module.exports = router;