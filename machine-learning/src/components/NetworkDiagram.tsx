import { ForwardPass, LayerParameters } from '../ml/INeuralNetwork';

interface NetworkDiagramProps {
  layers: LayerParameters[];
  forwardPass: ForwardPass;
  temperature: number;
}

const WIDTH = 640;
const HEIGHT = 320;
const MARGIN_X = 70;
const NODE_SPACING = 130;
const NODE_RADIUS = 28;
const LAYER_NAMES = ['Input', 'Hidden layer 1', 'Hidden layer 2', 'Output'];
const POSITIVE = '33, 150, 243'; // blue
const NEGATIVE = '255, 152, 0';  // orange
const WEIGHT_LABEL_POSITION = 0.3; // along each edge from its source, so crossing edges' labels don't collide

export function NetworkDiagram({ layers, forwardPass, temperature }: NetworkDiagramProps) {
  const { layerOutputs, scaledInput, prediction } = forwardPass;
  const layerCount = layerOutputs.length;

  const position = (layer: number, node: number) => ({
    x: MARGIN_X + (layer * (WIDTH - 2 * MARGIN_X)) / (layerCount - 1),
    y: HEIGHT / 2 + 10 + (node - (layerOutputs[layer].length - 1) / 2) * NODE_SPACING,
  });

  const edges = layers.flatMap((layer, l) =>
    layer.weights.flatMap((row, j) =>
      row.map((weight, i) => {
        const from = position(l, i);
        const to = position(l + 1, j);
        return { key: `${l}-${j}-${i}`, from, to, weight };
      })
    )
  );

  return (
    <div className="network-diagram">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Neural network diagram showing weights and neuron outputs">
        {LAYER_NAMES.map((name, l) => (
          <text key={name} x={position(l, 0).x} y={18} textAnchor="middle" className="layer-name">
            {name}
          </text>
        ))}

        {edges.map(({ key, from, to, weight }) => (
          <line
            key={key}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={`rgb(${weight >= 0 ? POSITIVE : NEGATIVE})`}
            strokeWidth={1 + Math.min(Math.abs(weight), 4) * 1.5}
            strokeOpacity={0.7}
          >
            <title>weight {weight.toFixed(3)}</title>
          </line>
        ))}

        {edges.map(({ key, from, to, weight }) => (
          <text
            key={`label-${key}`}
            x={from.x + (to.x - from.x) * WEIGHT_LABEL_POSITION}
            y={from.y + (to.y - from.y) * WEIGHT_LABEL_POSITION}
            textAnchor="middle"
            dominantBaseline="middle"
            className="weight-label"
          >
            {weight.toFixed(2)}
          </text>
        ))}

        {layerOutputs.map((outputs, l) =>
          outputs.map((value, j) => {
            const { x, y } = position(l, j);
            const isInput = l === 0;
            const isOutput = l === layerCount - 1;
            const isHidden = !isInput && !isOutput;
            const intensity = Math.min(Math.abs(value), 1);
            const fill = isHidden ? `rgba(${value >= 0 ? POSITIVE : NEGATIVE}, ${0.15 + 0.85 * intensity})` : 'white';

            return (
              <g key={`${l}-${j}`}>
                <circle cx={x} cy={y} r={NODE_RADIUS} fill={fill} className="neuron" />
                {isHidden && (
                  <text x={x} y={y - NODE_RADIUS - 6} textAnchor="middle" className="neuron-caption">
                    {String.fromCharCode(65 + j)}
                  </text>
                )}
                <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="neuron-value">
                  {isInput ? `${temperature.toFixed(1)}°` : isOutput ? Math.round(prediction) : value.toFixed(2)}
                </text>
                <text x={x} y={y + NODE_RADIUS + 14} textAnchor="middle" className="neuron-caption">
                  {isInput ? `scaled ${scaledInput.toFixed(2)}` : `bias ${layers[l - 1].biases[j].toFixed(2)}`}
                </text>
                {isOutput && (
                  <text x={x} y={y + NODE_RADIUS + 28} textAnchor="middle" className="neuron-caption">
                    sales
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      <p className="diagram-key">
        <span className="swatch positive" /> positive <span className="swatch negative" /> negative. Thicker lines are
        bigger weights. Each hidden neuron shows its output for this temperature: it adds up its weighted inputs plus its
        bias, then squashes the total through the activation function.
      </p>
    </div>
  );
}
