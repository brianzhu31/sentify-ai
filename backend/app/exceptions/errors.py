class APIError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class InsufficientArticlesError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
