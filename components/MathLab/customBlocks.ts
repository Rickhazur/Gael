import * as Blockly from 'blockly';

// Define custom blocks for Elementary Math

export const defineMathBlocks = () => {

    // 1. Number / Digit Block
    Blockly.Blocks['math_number_simple'] = {
        init: function () {
            this.appendDummyInput()
                .appendField(new Blockly.FieldNumber(0, 0, 9999), "NUM");
            this.setOutput(true, "Number");
            this.setColour("#FDB022"); // Pencil/Gold color
            this.setTooltip("Un número");
            this.setHelpUrl("");
        }
    };

    // 2. Vertical Addition Column
    Blockly.Blocks['vertical_column'] = {
        init: function () {
            this.appendValueInput("TOP")
                .setCheck("Number")
                .appendField("Arriba");
            this.appendValueInput("BOTTOM")
                .setCheck("Number")
                .appendField("Abajo");
            this.appendValueInput("RESULT")
                .setCheck("Number")
                .appendField("Resultado");
            this.setPreviousStatement(true, "Column");
            this.setNextStatement(true, "Column");
            this.setColour(160);
            this.setTooltip("Una columna de suma");
            this.setHelpUrl("");
        }
    };

    // 3. Operation Container (Notebook Style)
    Blockly.Blocks['math_operation_setup'] = {
        init: function () {
            this.appendDummyInput()
                .appendField("📝 Operación");
            this.appendStatementInput("COLUMNS")
                .setCheck("Column")
                .appendField("Pasos");
            this.setColour("#6941C6"); // Purple/Dark
            this.setTooltip("Configura tu operación aquí");
            this.setHelpUrl("");
            this.setDeletable(true);
            this.setMovable(true);
        }
    };
};
