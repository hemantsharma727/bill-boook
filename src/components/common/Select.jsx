import React, { useState } from 'react';
import { Text } from '@react-pdf/renderer';
import compose from '../../styles/compose';

const Select = ({ className, options, placeholder, value, onChange, pdfMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { name } = options.length ? options.find(item => item.stateCode === value) || { name: '' } : { name: '' };

  return (
    <>
      {pdfMode ? (
        <Text style={compose('span ' + (className ? className : ''))}>{name}</Text>
      ) : (
        <>
          {isEditing ? (
            <select
              className={'select ' + (className ? className : '')}
              value={value}
              onChange={onChange ? e => onChange(e.target.value) : undefined}
              onBlur={() => setIsEditing(false)}
              autoFocus={true}
            >
              {options.map(option => (
                <option key={option.name} value={option.stateCode}>
                  {option.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              readOnly={true}
              type="text"
              className={'input ' + (className ? className : '')}
              value={name || ''}
              placeholder={placeholder || ''}
              onFocus={() => setIsEditing(true)}
            />
          )}
        </>
      )}
    </>
  );
};

export default Select;
