type Props = {
  children: React.ReactNode;
};
const DashboardTable = (props: Props) => {
  return (
    <div className="h-[calc(100vh-200px)] w-full overflow-y-auto">
      {props.children}
    </div>
  );
};

export default DashboardTable;
