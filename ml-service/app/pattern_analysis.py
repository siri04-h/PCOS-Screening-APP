def analyze_pattern(data):
    insights = []

    if data["currentSleep"] < data["usualSleep"]:
        insights.append("Your sleep is below your usual pattern.")

    if data["currentStress"] > data["usualStress"]:
        insights.append("Your stress is higher than your normal pattern.")

    if data["currentEnergy"] < data["usualEnergy"]:
        insights.append("Your energy has decreased compared to your usual level.")

    if not insights:
        insights.append("No significant change from your usual pattern.")

    return {"insights": insights}