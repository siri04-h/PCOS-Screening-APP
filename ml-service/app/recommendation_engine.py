def generate_recommendations(data):
    recommendations = []

    if data.get("sleepHours", 8) < 6:
        recommendations.append(
            "Your sleep has been below your usual level. Try maintaining a consistent sleep schedule."
        )

    if data.get("stressLevel", "").lower() == "high":
        recommendations.append(
            "Your stress has been high. Consider a 10-minute breathing or relaxation exercise."
        )

    if data.get("waterIntake", 2) < 1.5:
        recommendations.append(
            "Increase your water intake to stay hydrated."
        )

    if data.get("activityLevel", "").lower() == "low":
        recommendations.append(
            "Try adding light walking or stretching if you're comfortable."
        )

    if not recommendations:
        recommendations.append("You're maintaining healthy habits. Keep tracking consistently.")

    return recommendations