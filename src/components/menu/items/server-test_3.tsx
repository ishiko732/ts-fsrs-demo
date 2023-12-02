import MenuItem from ".";

async function ServerTest() {
  const submit = async (formData: FormData) => {
    "use server";
    console.log(formData);
    console.log("hello");
  };

  return (
    <MenuItem tip="Server Test" formAction={submit}>
      <button className="btn btn-xs" type="submit">
        TEST
      </button>
    </MenuItem>
  );
}

export default ServerTest;
