import React, { Component } from 'react';
import './App.css';
import cloneDeep from "lodash/cloneDeep";
import { ResponsiveNetworkFrame } from "semiotic";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: null,
            nodeNum: 1,
            chartOpts: null
        };
    }

    componentDidMount() {
        this.createAndSetOpts({key: 0, name: "node", height: 100, width: 150}, 130000);
    }

    addNode = (nodeId) => {
        // network call occurrs
        // returns updated node with updated children
        console.log('add node to node', nodeId);
        let oldNodes = cloneDeep(this.state.nodes);
        let updatedNodes = this.findAndAddChild(oldNodes, nodeId);
        this.setState({
            nodeNum: this.state.nodeNum + 1
        })
        this.createAndSetOpts(updatedNodes);
    }

    findAndAddChild(node, nodeKey) {
        if (node.key === nodeKey) {
            if (!node.children) {
                node.children = [];
            }

            node.children.push({key: this.state.nodeNum, name: "node", height: 100, width: 150});
            return node;
        } else if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i] = this.findAndAddChild(node.children[i], nodeKey);
            }
        }

        return node;
    }

    removeNode(removeKey) {
        console.log('remove node', removeKey);
    }

    calculateSizeFromArea(graphArea, aspectRatio) {
        console.log('graph area and aspect ratio', graphArea, aspectRatio);
        if (!aspectRatio) { aspectRatio = 1}
        let height = Math.sqrt(graphArea / aspectRatio);
        let width = height * aspectRatio;
        console.log('size', [Math.floor(width), Math.floor(height)]);
        return [Math.floor(width), Math.floor(height)];
    }

    createAndSetOpts = async (updatedNodes) => {
        await this.setState({ nodes: updatedNodes });
        console.log('inside of create and set opts, nodenum', this.state.nodeNum);

        let networkChart = {
            size: this.calculateSizeFromArea(this.state.nodeNum * 130000, window.outerWidth/window.outerHeight),
            margin: 10,
            nodeIDAccessor: "key",
            networkType: {
                type: "force",
                iterations: 500,
                zoom: "stretch",
                distanceMax: 700,
                edgeStrength: 0.75
            },
            edgeStyle: (d) => {
                return {stroke: 'black', strokeWidth: 1.5}
            },
            customNodeIcon: (node) => {
                return (
                    <foreignObject
                        key={node.d.key}
                        transform={`translate(${node.d.x - 50}, ${node.d.y})`}
                        height={node.d.height}
                        width={node.d.width}>
                        <div className="node">
                            <p>{`${node.d.name} ${node.d.key}`}</p>
                            <div>
                                <button onClick={() => this.addNode(node.d.key)}>add</button>
                                <button onClick={() => this.removeNode(node.d.key)}>remove</button>
                            </div>
                        </div>
                    </foreignObject>
                )
            }
        }

        if (!this.state.nodes.children || this.state.nodes.children.length === 0) {
            networkChart.nodes = [this.state.nodes]
        } else {
            networkChart.edges = this.state.nodes
        }

        console.log(networkChart);

        this.setState({
            chartOpts: networkChart
        })
    }


    render() {
        return (
            <div className="App">
                <ResponsiveNetworkFrame {...this.state.chartOpts}/>
            </div>
        );
    }
}

export default App;
