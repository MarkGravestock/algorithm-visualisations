import { DataPoint } from '../ml/ILinearRegression';
import { validateDataPoint } from '../utils/dataGenerator';

interface DataTableProps {
  data: DataPoint[];
  onDataChange: (newData: DataPoint[]) => void;
}

export function DataTable({ data, onDataChange }: DataTableProps) {
  const handleCellEdit = (index: number, field: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value);
    if (!validateDataPoint(numValue, 0)) {
      return;
    }

    const newData = [...data];
    newData[index] = { ...newData[index], [field]: numValue };
    onDataChange(newData);
  };

  const handleDelete = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onDataChange(newData);
  };

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={cellStyle}>#</th>
            <th style={cellStyle}>Temperature (°C)</th>
            <th style={cellStyle}>Sales</th>
            <th style={cellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point, index) => (
            <tr key={index}>
              <td style={cellStyle}>{index + 1}</td>
              <td style={cellStyle}>
                <input
                  type="number"
                  step="0.1"
                  value={point.x}
                  onChange={(e) => handleCellEdit(index, 'x', e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td style={cellStyle}>
                <input
                  type="number"
                  step="0.1"
                  value={point.y}
                  onChange={(e) => handleCellEdit(index, 'y', e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td style={cellStyle}>
                <button
                  onClick={() => handleDelete(index)}
                  style={deleteButtonStyle}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  textAlign: 'center',
};

const deleteButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#ff4444',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
