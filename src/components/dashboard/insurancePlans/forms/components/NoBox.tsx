const NoBox = ({ mode }: { mode: "assignPlan" | "documentUpload" }) => {
  return (
    <div className="flex h-[82px] w-full items-center justify-center rounded-md border-2 border-dotted border-[#d8dadc] leading-none">
      <p className="w-[72%] text-center text-[10.5px] text-[#909090]">
        {mode === "assignPlan" ? (
          <>
            You have no organizations assigned to this insurance plan yet. Click
            the dropdown below to add organizations to this plan!
          </>
        ) : mode === "documentUpload" ? (
          <>
            You have no documents linked to this insurance plan yet. Click the{" "}
            <span className="text-blue-600">+</span>
            button to upload at least one document! This is typically an
            Explanation of Benefits (EOB) document that users can refer to.
          </>
        ) : null}
      </p>
    </div>
  );
};

export default NoBox;
