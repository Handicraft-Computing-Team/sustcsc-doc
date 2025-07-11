import math

def calculate_score(T: float) -> float:
    """
    Calculate Score(T) based on the following rules:
    - Score = 0 if T >= 360
    - Score = 100 * log(360 / T) / log(360 / 60) if 60 <= T < 360
    - Score = 100 if T <= 60

    Args:
        T (float): Time in seconds

    Returns:
        float: Score between 0 and 100
    """
    if T >= 360:
        return 0.0
    elif T >= 60:
        return 100 * math.log(360 / T) / math.log(360 / 60)
    else:
        return 100.0

if __name__ == "__main__":
    try:
        T_input = float(input("Enter T (seconds): "))
        score = calculate_score(T_input)
        print(f"Score(T={T_input}) = {score:.2f}")
    except ValueError:
        print("Invalid input. Please enter a numeric value.")
