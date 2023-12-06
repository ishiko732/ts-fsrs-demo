import MenuItem from ".";

async function ServerTest() {
  const submit = async (formData: FormData) => {
    "use server";
    console.log(formData);
    console.log("hello");
  };

  return (
    <MenuItem tip="Server Test" formAction={submit} disable={process.env.NODE_ENV === "production"}>
      <button className="btn btn-square btn-xs" type="submit">
        TEST
      </button>
    </MenuItem>
  );
}

export default ServerTest;
