import React, { useEffect, useState } from 'react';
import { BlocklyWorkspace } from 'react-blockly';
import * as Blockly from 'blockly';
import { defineMathBlocks } from './customBlocks';
import './blocklyStyles.css'; // We'll create this next

// Initialize custom blocks
defineMathBlocks();

interface MathBlockWorkspaceProps {
    onWorkspaceChange: (xml: string, code: string) => void;
    initialXml?: string;
}

const toolboxCategory = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Números',
            colour: '#5fa2db',
            contents: [
                {
                    kind: 'block',
                    type: 'math_number_simple'
                }
            ]
        },
        {
            kind: 'category',
            name: 'Estructura',
            colour: '#a55b80',
            contents: [
                {
                    kind: 'block',
                    type: 'math_operation_setup'
                },
                {
                    kind: 'block',
                    type: 'vertical_column'
                }
            ]
        }
    ]
};

export const MathBlockWorkspace: React.FC<MathBlockWorkspaceProps> = ({ onWorkspaceChange, initialXml }) => {
    const [xml, setXml] = useState(initialXml || '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>');

    const workspaceConfiguration = {
        grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true,
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
        },
        trashcan: true
    };

    return (
        <div className="w-full h-full min-h-[500px] border-2 border-gray-200 rounded-lg overflow-hidden">
            <BlocklyWorkspace
                className="w-full h-full"
                toolboxConfiguration={toolboxCategory}
                initialXml={initialXml}
                workspaceConfiguration={workspaceConfiguration}
                onXmlChange={(newXml) => {
                    setXml(newXml);
                    // Minimal code generation or just structure analysis
                    onWorkspaceChange(newXml, "");
                }}
            />
        </div>
    );
};
