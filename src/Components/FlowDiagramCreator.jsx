import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from "reactflow";
import { useDrag, useDrop } from "react-dnd";
import "reactflow/dist/style.css";
import { Undo, RefreshCw, Download } from "lucide-react";

const DraggableItem = ({ id, text, onDrop }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "node",
    item: { id, text },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDrop(item, dropResult);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 mb-2 bg-[#90b3ff] rounded border-[1px] border-[#C9DFFF] shadow-[#9ec4fe] shadow-sm cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {text}
    </div>
  );
};

const FlowDiagramCreator = () => {
  const [inputText, setInputText] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nextId, setNextId] = useState(1);
  const [items, setItems] = useState([]);
  const reactFlowWrapper = useRef(null);
  const [selectedFormat, setSelectedFormat] = useState(".py");
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleCreateItems = () => {
    if (inputText.trim() !== "") {
      const newItem = {
        id: `item-${nextId}`,
        text: inputText.trim(),
      };
      setItems((prevItems) => [...prevItems, newItem]);
      setNextId(nextId + 1);
      setInputText("");
    }
  };
  const handleDownload = () => {
    const content = generatePreview();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flow-diagram${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUndo = () => {
    setEdges((eds) => eds.slice(0, -1));
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setNextId(1);
    setItems([]);
  };

  const onDrop = useCallback(
    (item, dropResult) => {
      if (reactFlowInstance) {
        const position = reactFlowInstance.project({
          x: dropResult.x,
          y: dropResult.y,
        });
        const newNode = {
          id: item.id,
          type: "default",
          position,
          data: { label: item.text },
        };
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance]
  );

  const [, drop] = useDrop(() => ({
    accept: "node",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      return {
        x: offset.x - bounds.left,
        y: offset.y - bounds.top,
      };
    },
  }));

  const generatePreview = () => {
    const connectedNodes = new Set();
    edges.forEach((edge) => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const sortedNodes = nodes
      .filter((node) => connectedNodes.has(node.id))
      .sort((a, b) => {
        const aConnections = edges.filter(
          (edge) => edge.source === a.id || edge.target === a.id
        ).length;
        const bConnections = edges.filter(
          (edge) => edge.source === b.id || edge.target === b.id
        ).length;
        return bConnections - aConnections;
      });

    return sortedNodes.map((node) => node.data.label).join(" ");
  };

  return (
    <div className="h-screen flex justify-between bg-[#12161D]">
      <div className="flex flex-col w-[76vw]">
        <div className="mx-[1vw] w-[76vw] my-[0.5vh] bg-[#12161D] shadow-md">
          <textarea
            className="w-full text-gray-100 bg-[#091327] p-3 focus:shadow-md focus:shadow-[#5694FE] border border-[#5694FE] rounded-lg focus:ring-[1px] focus:ring-[#5094fb] focus:border-transparent resize-none"
            rows="4"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter your prompt..."
          />
          <div className="flex justify-between mt-[0.5vh]">
            <button
              className="px-6 py-2 bg-[#1E4289] text-white rounded-full hover:bg-[#315DB0] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={handleCreateItems}
            >
              Create Items
            </button>
            <div className="space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-l-full hover:bg-gray-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={handleUndo}
                title="Undo last connection"
              >
                <Undo size={20} />
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-r-full hover:bg-red-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                onClick={handleReset}
                title="Reset all nodes"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
        <ReactFlowProvider>
          <div className="flex-grow  relative" ref={reactFlowWrapper}>
            <div ref={drop} className="h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                fitView
                className="bg-[#12161D]  m-[2vh] border-[1px] border-[#5694FE] rounded-xl shadow-sm shadow-sm-[#5694FE]"
              >
                <Background
                  variant="dots"
                  gap={20}
                  size={1}
                  color="#ffffff"
                  style={{ backgroundColor: "#12161D" }}
                />
                <Controls />
              </ReactFlow>
            </div>
          </div>
        </ReactFlowProvider>
        <div className="p-6 bg-[#12161D] shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-gray-300">Preview:</h3>
            <div className="flex items-center">
              <select
                className="mr-2 bg-[#091327] text-gray-300 border border-[#5694FE] rounded-md p-1"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                {[
                  ".java",
                  ".py",
                  ".js",
                  ".jsx",
                  ".ts",
                  ".tsx",
                  ".cpp",
                  ".c",
                ].map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
              <button
                className="flex items-center px-4 py-2 bg-[#1E4289] text-white rounded-full hover:bg-[#315DB0] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={handleDownload}
              >
                <Download size={20} className="mr-2" />
                Download
              </button>
            </div>
          </div>
          <p className="bg-[#153475] p-3 rounded-lg border border-gray-200">
            {generatePreview()}
          </p>
        </div>
      </div>
      <div className="w-[21vw] p-2 bg-[#091327] border-l-[1px] border-[#5694FE] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-300 border-b-[2px] border-spacing-1 border-dashed border-[#2a5cc1]">
          Draggable Items
        </h2>
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            id={item.id}
            text={item.text}
            onDrop={onDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default FlowDiagramCreator;
