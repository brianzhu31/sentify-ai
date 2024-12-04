class ExternalAPIError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class InsufficientArticlesError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class ExternalAPITimeoutError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class NotFoundError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class DBCommitError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class InvalidRequestError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class PermissionDeniedError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class DailyMessageCountExceededError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
