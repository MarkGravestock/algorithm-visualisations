import { DataPoint2D } from '../ml/ILinearRegression';
import { validateDataPoint2D } from '../utils/dataGenerator';

interface DataTable2DProps {
  data: DataPoint2D[];
  onDataChange: (newData: DataPoint2D[]) => void;
}

export function DataTable2D({ data, onDataChange }: DataTable2DProps) {
  const handleCellEdit = (index: number, field: 'x1' | 'x2' | 'y', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newData = [...data];
    const point = { ...newData[index] };

    if (field === 'x1') {
      point.x1 = numValue;
    } else if (field === 'x2') {
      point.x2 = numValue;
    } else {
      point.y = Math.round(numValue); // Sales must be whole numbers
    }

    // Validate before updating
    if (validateDataPoint2D(point.x1, point.x2, point.y)) {
      newData[index] = point;
      onDataChange(newData);
    }
  };

  return (
    <div className="data-table-container">
      <h3>Training Data (Editable)</h3>
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Temperature (°C)</th>
              <th>Unemployment (%)</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="number"
                    value={point.x1}
                    onChange={(e) => handleCellEdit(index, 'x1', e.target.value)}
                    step="0.1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={point.x2}
                    onChange={(e) => handleCellEdit(index, 'x2', e.target.value)}
                    step="0.1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={point.y}
                    onChange={(e) => handleCellEdit(index, 'y', e.target.value)}
                    step="1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
