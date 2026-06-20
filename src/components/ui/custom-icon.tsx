import { Icon, IconifyIcon } from "@iconify/react";
import { ComponentProps } from "react";

type IconifyProps = ComponentProps<typeof Icon>;

interface CustomIconProps extends Omit<IconifyProps, "icon"> {
  iconName: string;
}

export const CustomIcon = ({ iconName, ...props }: CustomIconProps) => {
  return <Icon icon={iconName} {...props} />;
};
