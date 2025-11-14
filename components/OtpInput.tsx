import React, {useRef, useEffect} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';

interface OtpInputProps {
  length: number;
  value: string[];
  onChange: (otp: string[]) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length,
  value,
  onChange,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...value];

    if (text.length === 0) {
      newOtp[index] = '';
      onChange(newOtp);
      return;
    }

    if (/^[0-9]$/.test(text)) {
      newOtp[index] = text;
      onChange(newOtp);

      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({length}).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputRefs.current[index] = ref;
          }}
          style={styles.input}
          maxLength={1}
          keyboardType="number-pad"
          value={value[index]}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  input: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
