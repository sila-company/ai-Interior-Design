package com.atelier.android.feature.auth

import com.atelier.android.MainDispatcherRule
import com.atelier.android.core.auth.AuthRepository
import com.atelier.android.core.model.UserDto
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class AuthViewModelsTest {
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun loginSuccessRoutesAuthenticatedUser() = runTest {
        val user = UserDto("u1", "a@example.com", "Ada")
        var authenticated: UserDto? = null
        val viewModel = LoginViewModel(FakeAuthRepository(loginResult = Result.success(user))) {
            authenticated = it
        }

        viewModel.onEmailChanged("a@example.com")
        viewModel.onPasswordChanged("password123")
        viewModel.submit()

        assertEquals(user, authenticated)
        assertFalse(viewModel.uiState.value.isSubmitting)
    }

    @Test
    fun loginFailureMapsInlineError() = runTest {
        val viewModel = LoginViewModel(
            FakeAuthRepository(loginResult = Result.failure(IllegalStateException("Incorrect email or password."))),
        ) {}

        viewModel.onEmailChanged("a@example.com")
        viewModel.onPasswordChanged("wrongpass")
        viewModel.submit()

        assertEquals("Incorrect email or password.", viewModel.uiState.value.errorMessage)
        assertFalse(viewModel.uiState.value.isSubmitting)
    }

    @Test
    fun registerSuccessRoutesAuthenticatedUser() = runTest {
        val user = UserDto("u1", "a@example.com", "Ada")
        var authenticated: UserDto? = null
        val viewModel = RegisterViewModel(FakeAuthRepository(registerResult = Result.success(user))) {
            authenticated = it
        }

        viewModel.onNameChanged("Ada")
        viewModel.onEmailChanged("a@example.com")
        viewModel.onPasswordChanged("password123")
        viewModel.submit()

        assertEquals(user, authenticated)
        assertTrue(viewModel.uiState.value.errorMessage == null)
    }
}

private class FakeAuthRepository(
    private val loginResult: Result<UserDto> = Result.success(UserDto("u", "e", "n")),
    private val registerResult: Result<UserDto> = Result.success(UserDto("u", "e", "n")),
) : AuthRepository {
    override suspend fun getCurrentUser(): UserDto = UserDto("u", "e", "n")
    override suspend fun restoreSession(): UserDto? = null
    override suspend fun register(name: String, email: String, password: String): UserDto =
        registerResult.getOrThrow()
    override suspend fun login(email: String, password: String): UserDto =
        loginResult.getOrThrow()
    override suspend fun logout() = Unit
}
