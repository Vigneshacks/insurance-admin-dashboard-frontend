const UserBox = ({
  background = "E8FBF7",
  color = "000000",
  children,
}: {
  background?: string;
  color?: string;
  children: React.ReactNode;
}) => {
  return (
    <span
      className="inline-block rounded-full px-2 py-1 text-[11px] font-medium"
      style={{ backgroundColor: `#${background}`, color: `#${color}` }}
    >
      {children}
    </span>
  );
};

export default UserBox;
