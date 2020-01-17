import React, { Component } from 'react';
import './App.css';
import cloneDeep from "lodash/cloneDeep";
import { ResponsiveNetworkFrame } from "semiotic";

const NODE_AREA = 140000;

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
        //initialize graph with single parent node
        this.createAndSetOpts({key: 0, name: "node", height: 100, width: 150}, NODE_AREA);
    }

    addNode = (nodeId) => {
        // network call occurs
        // returns updated node with updated children
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

    findAndRemoveNode(node, nodeKey) {
        if (node.key === nodeKey) {
            return;
        } else if (node.children && node.children.length > 0) {
            var childCount = 0;
            for (let i = 0; i < node.children.length; i++) {
                let child = this.findAndRemoveNode(node.children[i], nodeKey);
                if (child) {
                    node.children[childCount++] = child;
                }
            }
            node.children.length = childCount;
        }
        return node;
    }

    removeNode(removeKey) {
        if (removeKey === 0) {
            console.log('cannot remove parent node, exiting');
            return;
        }
        // network call occurs
        // returns updated node with updated children
        let oldNodes = cloneDeep(this.state.nodes);
        let updatedNodes = this.findAndRemoveNode(oldNodes, removeKey);
        this.setState({
            nodeNum: this.state.nodeNum - 1
        })
        this.createAndSetOpts(updatedNodes);
    }

    /**
     * calculateSizeFromArea will return [width, height] given a required graph area.
     * It will keep the aspectRatio if provided, otherwise it'll be square
     *
     * @param graphArea: required area of graph that sides must fulfill
     * @param aspectRatio: (x/y) desired ratio of width/height to preserve when calculating sides of rectangle
     */
    calculateSizeFromArea(graphArea, aspectRatio) {
        if (!aspectRatio) { aspectRatio = 1}
        let height = Math.sqrt(graphArea / aspectRatio);
        let width = height * aspectRatio;
        return [Math.floor(width), Math.floor(height)];
    }

    createAndSetOpts = async (updatedNodes) => {
        await this.setState({ nodes: updatedNodes });

        let networkChart = {
            size: this.calculateSizeFromArea(this.state.nodeNum * NODE_AREA, window.outerWidth/window.outerHeight),
            nodeIDAccessor: "key",
            networkType: {
                type: "force",
                iterations: 500,
                zoom: "stretch",
                forceManyBody:  (d) => {
                    return -2 * d.height;
                },
                distanceMax: 200,
                edgeStrength: 10
            },
            edgeStyle: (d) => {
                return {stroke: 'black', strokeWidth: 1.5}
            },
            nodeSizeAccessor: (d) => { return 30 },
            customNodeIcon: (node) => {
                return (
                    <foreignObject
                        key={node.d.key}
                        transform={`translate(${node.d.x - 50}, ${node.d.y})`}
                        // firefox/safari both need explicit foreign object height/width to work
                        height={node.d.height}
                        width={node.d.width}>
                        <div className={`node ${node.d.key === 0 ? 'primary' : ''}`}>
                            <div>
                                <p>{`${node.d.name} ${node.d.key}`}</p>
                                <p className="children">{` # of children: ${node.d.children ? node.d.children.length : 0} `}</p>
                            </div>
                            <div>
                                <button onClick={() => this.addNode(node.d.key)}>add</button>
                                <button onClick={() => this.removeNode(node.d.key)}>remove</button>
                            </div>
                        </div>
                    </foreignObject>
                )
            }
        }

        // if only one node exists with no children, graph will not render
        // have to set nodes to an array of one, then it will render properly
        if (!this.state.nodes.children || this.state.nodes.children.length === 0) {
            networkChart.nodes = [this.state.nodes];
        } else {
            networkChart.edges = this.state.nodes;
        }

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
