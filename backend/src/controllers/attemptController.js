const { exec } = require("child_process");

exports.checkCheating = (req, res) => {
  const { copyCount, tabSwitchCount, timeSpent, score } = req.body;

  const command = `python ../ml/predict.py ${copyCount} ${tabSwitchCount} ${timeSpent} ${score}`;

  exec(command, (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: "ML prediction failed" });
    }

    const cheating = Number(stdout.trim());

    res.json({
      cheating,
      message: cheating ? "Cheating detected" : "No cheating detected",
    });
  });
};
