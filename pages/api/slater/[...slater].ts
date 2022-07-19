// @ts-nocheck
import { slater } from "@slaterjs/next";
import { run } from "@/lib/run";

const config = {
  tasks: [
    {
      name: "run",
      schedule: "* * * * *", // run every minute
      handler: async (event, success, failure) => {
        try {
          await run();
          success();
        } catch (err) {
          return failure(err); // sends 500
        }
      },
    },
  ],
};

export default slater(config);
