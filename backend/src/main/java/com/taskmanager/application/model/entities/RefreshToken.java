package com.taskmanager.application.model.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "refresh_token")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenIdentifier;

    @Column(nullable = false, length = 255)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private AuthSession session;

    @Column(length = 64)
    private String parentTokenIdentifier;

    @Column(length = 64)
    private String replacedByTokenIdentifier;

    @Column(nullable = false)
    private Date createdAt;

    @Column(nullable = false)
    private Date expiresAt;

    private Date usedAt;

    private Date revokedAt;

    @Column(length = 255)
    private String revokeReason;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTokenIdentifier() {
        return tokenIdentifier;
    }

    public void setTokenIdentifier(String tokenIdentifier) {
        this.tokenIdentifier = tokenIdentifier;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public AuthSession getSession() {
        return session;
    }

    public void setSession(AuthSession session) {
        this.session = session;
    }

    public String getParentTokenIdentifier() {
        return parentTokenIdentifier;
    }

    public void setParentTokenIdentifier(String parentTokenIdentifier) {
        this.parentTokenIdentifier = parentTokenIdentifier;
    }

    public String getReplacedByTokenIdentifier() {
        return replacedByTokenIdentifier;
    }

    public void setReplacedByTokenIdentifier(String replacedByTokenIdentifier) {
        this.replacedByTokenIdentifier = replacedByTokenIdentifier;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Date getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Date usedAt) {
        this.usedAt = usedAt;
    }

    public Date getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(Date revokedAt) {
        this.revokedAt = revokedAt;
    }

    public String getRevokeReason() {
        return revokeReason;
    }

    public void setRevokeReason(String revokeReason) {
        this.revokeReason = revokeReason;
    }

    public boolean isActive(Date now) {
        return revokedAt == null && expiresAt != null && expiresAt.after(now);
    }
}
