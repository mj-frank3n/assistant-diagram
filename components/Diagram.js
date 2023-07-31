import ReactFlow, {Controls, Background, useNodesState, useEdgesState, addEdge} from 'reactflow';
import 'reactflow/dist/style.css';
import {useCallback, useRef, useState} from "react";

const data = {
  "name": "InsuranceClaim",
  "steps": [
    {
      "step": "1",
      "type": "question",
      "prompt": "What is your full name?",
      "entity": "text",
      "variable": "Claimant.FullName",
      "resourceUrl": "https://example.com/step1",
      "transitions": [
        {
          "next": "2"
        }
      ]
    },
    {
      "step": "2",
      "type": "question",
      "prompt": "What is your email address?",
      "entity": "text",
      "variable": "Claimant.Email",
      "resourceUrl": "https://example.com/step2",
      "transitions": [
        {
          "next": "3"
        }
      ]
    },
    {
      "step": "3",
      "type": "question",
      "prompt": "What is your gender?",
      "entity": "list",
      "items": [
        { "id": "male", "displayName": "Male" },
        { "id": "female", "displayName": "Female" },
        { "id": "other", "displayName": "Other" }
      ],
      "variable": "Claimant.Gender",
      "resourceUrl": "https://example.com/step3",
      "transitions": [
        {
          "next": "4"
        }
      ]
    },
    {
      "step": "4",
      "type": "message",
      "prompt": "Thank you for providing your information, {Claimant.FullName}. Your email address is {Claimant.Email}. We have your details recorded for future references.",
      "activity": "Thank you for providing your information, {Claimant.FullName}. Your email address is {Claimant.Email}. We have your details recorded for future references.",
      "resourceUrl": "https://example.com/step4",
      "transitions": [
        {
          "next": "5"
        }
      ]
    },
    {
      "step": "5",
      "type": "question",
      "prompt": "Would you like to connect to a real agent to discuss your claim?",
      "entity": "list",
      "items": [
        { "id": "yes", "displayName": "Yes" },
        { "id": "no", "displayName": "No" }
      ],
      "variable": "ConnectToAgent",
      "resourceUrl": "https://example.com/step5",
      "transitions": [
        {
          "next": "6",
          "condition": "ConnectToAgent = 'yes'"
        },
        {
          "next": "7",
          "condition": "ConnectToAgent = 'no'"
        }
      ]
    },
    {
      "step": "6",
      "type": "transfer",
      "prompt": "Great! Connecting you to a real agent...",
      "resourceUrl": "https://example.com/step6",
      "transitions": [
        {
          "next": "8"
        }
      ]
    },
    {
      "step": "7",
      "type": "message",
      "prompt": "Alright! If you have any further questions, feel free to reach out to us later. Have a nice day!",
      "activity": "Alright! If you have any further questions, feel free to reach out to us later. Have a nice day!",
      "resourceUrl": "https://example.com/step7",
      "transitions": [
        {
          "next": "8"
        }
      ]
    },
    {
      "step": "8",
      "type": "finished",
      "resourceUrl": "https://example.com/step8"
    }
  ]
};

function convertToReactFlowJson(inputJson) {
  const nodes = [];
  const edges = [];

  const nodePositions = {
    x: 50,
    y: 50,
  };

  const edgePositionOffset = 150;

  inputJson.steps.forEach((step, index) => {
    const nodeId = `node-${step.step}`;
    const node = {
      id: nodeId,
      //type: step.type === 'finished' ? 'output' : 'input',
      data: {
        label: step.type === 'finished' ? 'Finished' : step.prompt || step.activity,
        resourceUrl: step.resourceUrl,
        entity: step.entity,
        variable: step.variable,
        items: step.items,
        condition: step.condition,
      },
      position: {
        x: nodePositions.x + index * edgePositionOffset,
        y: nodePositions.y + index * edgePositionOffset,
      },
      draggable: true,
    };

    nodes.push(node);

    if (step.transitions) {
      step.transitions.forEach((transition) => {
        const edge = {
          id: `edge-${nodeId}-${transition.next}`,
          source: nodeId,
          target: `node-${transition.next}`,
          label: transition.condition || '',
        };
        edges.push(edge);
      });
    }
  });

  return { nodes, edges };
}

function Diagram() {
  const model = convertToReactFlowJson(data);
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(model.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div style={{ height: '100%', width: '100vw' }}>
      <ReactFlow nodes={nodes} edges={model.edges} onNodesChange={onNodesChange}
                 onEdgesChange={onEdgesChange}
                 onInit={setReactFlowInstance}
                 onDrop={onDrop}
                 onDragOver={onDragOver}
                 fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Diagram;
