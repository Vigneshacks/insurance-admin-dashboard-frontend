const TableMenuContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="inline-flex flex-col items-end p-2.5 bg-white">
    <div className="flex flex-col items-start gap-2.5 self-stretch pr-2">
      <div className="flex flex-col items-start gap-2.5 w-[9.0625rem] rounded-[0.3125rem] border border-[#d8dadc] bg-white py-[0.3125rem]">
        {children}
      </div>
    </div>
  </div>
);

export default TableMenuContainer;
