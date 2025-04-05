import React from 'react';

const MonthDropdown = ({ selectedMonth, onMonthChange }) => {
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div>
      <label>Select Month:</label>
      <select 
        style={{ border: '1px solid grey' }} 
        value={selectedMonth} 
        onChange={(e) => onMonthChange(e.target.value)}
      >
        <option value="">All Months</option>
        {months.map(month => (
          <option key={month.value} value={month.value}>{month.label}</option>
        ))}
      </select>
    </div>
  );
};

export default MonthDropdown;
