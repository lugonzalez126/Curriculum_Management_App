def get_order_value(items: list, position: int) -> float:
    if not items:
        return 1.0

    if position <= 0:
        return items[0].order - 1.0

    if position >= len(items):
        return items[-1].order + 1.0

    return (items[position - 1].order + items[position].order) / 2s