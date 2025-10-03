import authReducer, { setToken, clearToken } from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    token: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setToken', () => {
    const token = 'eyJhbGciOiJSUzI1NiJ9.test.token';
    const actual = authReducer(initialState, setToken(token));
    
    expect(actual.token).toEqual(token);
  });

  it('should handle clearToken', () => {
    const stateWithToken = {
      token: 'eyJhbGciOiJSUzI1NiJ9.test.token',
    };
    
    const actual = authReducer(stateWithToken, clearToken());
    
    expect(actual.token).toBeNull();
  });

  it('should handle multiple setToken calls', () => {
    const token1 = 'token1';
    const token2 = 'token2';
    
    let state = authReducer(initialState, setToken(token1));
    expect(state.token).toEqual(token1);
    
    state = authReducer(state, setToken(token2));
    expect(state.token).toEqual(token2);
  });

  it('should handle setToken followed by clearToken', () => {
    const token = 'test-token';
    
    let state = authReducer(initialState, setToken(token));
    expect(state.token).toEqual(token);
    
    state = authReducer(state, clearToken());
    expect(state.token).toBeNull();
  });

  it('should handle clearToken when token is already null', () => {
    const actual = authReducer(initialState, clearToken());
    
    expect(actual.token).toBeNull();
  });

  it('should handle setToken with empty string', () => {
    const actual = authReducer(initialState, setToken(''));
    
    expect(actual.token).toEqual('');
  });

  it('should handle setToken with null', () => {
    const actual = authReducer(initialState, setToken(null));
    
    expect(actual.token).toBeNull();
  });
});
