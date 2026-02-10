"use client";

import React, { useState } from "react";

const Form = () => {
  const [file, setFile] = useState<File>();
  const [to, setTo] = useState<string>("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      console.error("No FILE FOUND !!");
      return;
    }
    if (!to) {
      console.error("No 'To' FOUND !!");
      return;
    }
    try {
      const data = new FormData();
      data.set("file", file);
      data.set("to", to);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      console.log("Id : " + id);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <form onSubmit={submit}>
      <input
        type="file"
        name="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setFile(file);
        }}
      />
      <div className="flex flex-col gap-5 w-10">
        {/* Make it work then Make it Good */}
        <label htmlFor="" className="font-semibold">
          To :
        </label>
        <input
          type="text"
          name="to"
          className="w-full py-2 px-4 rounded-lg border-blue-100"
          onChange={(e) => setTo(e.target.value)}
          value={to}
        />
      </div>
      <input type="submit" value="Upload" />
    </form>
  );
};

export default Form;
