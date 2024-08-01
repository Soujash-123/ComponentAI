// import logo from './logo.svg';
import './App.css';

// import { ReactFlow, Controls, Background } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import Navbar from './Components/Navbar';
import FlowDiagramCreator from './Components/FlowDiagramCreator';
 
// const initialNodes = [
//   { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
//   { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
// ];
// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
 

function App() {
  return (
    <>
    {/* <div style={{ width: '100vw', height: '100vh', backgroundColor:'#12161d' }} className='bg-gray-900'>
      <ReactFlow nodes={initialNodes} edges={initialEdges} >
        <Background/>
        <Controls/>
        </ReactFlow>

    </div> */}
    {/* Navbar- not of full width
    -Name
    -border-dotted */}
    <Navbar/>
    <FlowDiagramCreator/>

    </>
  );
}

export default App;
