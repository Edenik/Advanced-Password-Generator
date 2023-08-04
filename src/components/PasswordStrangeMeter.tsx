import React from 'react';
import styled from '@emotion/styled';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { createPasswordLabel, passwordStrengthColors } from '../utils/common';

const PasswordStrengthMeterContainer = styled.div`
  text-align: left;
`;

const PasswordStrengthMeterProgress = styled.progress<{ score: number }>`
  appearance: none;
  width: 250px;
  height: 8px;
  &::-webkit-progress-bar {
    background-color: #eee;
    border-radius: 3px;
  }

  &::-webkit-progress-value {
    border-radius: 2px;
    background-size: 35px 20px, 100% 100%, 100% 100%;
    background-color: ${props => passwordStrengthColors[createPasswordLabel(props.score)] || ''};
  }
`;

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
    fontSize: 18
  },
});

interface PasswordStrengthMeterProps {
  score: number;
  message: string[];
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ score, message }) => {
  return (
    <CustomWidthTooltip title={message.join('\n')}>
      <PasswordStrengthMeterContainer>
        <PasswordStrengthMeterProgress value={score} max="4" score={score} />
        <br />
        <label>
          {score != null && <>
            <strong>Password strength:</strong> {createPasswordLabel(score)}
          </>}
        </label>
      </PasswordStrengthMeterContainer>
    </CustomWidthTooltip>
  );
};

export default PasswordStrengthMeter;
