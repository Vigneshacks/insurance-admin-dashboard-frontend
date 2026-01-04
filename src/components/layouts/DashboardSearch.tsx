import { IoSearch } from "react-icons/io5";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

const DashboardSearch = ({ value, onChange, placeholder }: Props) => {
  return (
    <form
      className="flex h-10 w-full items-center rounded-[5px] border border-[#d8dadc] bg-white pl-[15px]"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <IoSearch className="text-[#1E4477]" size={24} />
      <input
        className="h-full w-full px-2 py-2 text-sm text-[#919191] placeholder:text-[#919191] focus:outline-none"
        placeholder={placeholder || "Search"}
        value={value}
        onChange={onChange}
      />
    </form>
  );
};

export default DashboardSearch;