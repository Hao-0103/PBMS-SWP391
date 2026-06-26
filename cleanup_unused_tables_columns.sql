/*
====================================================================
 PBMS DATABASE CLEANUP SCRIPT
 Mục đích: Xóa các bảng và cột không được sử dụng trong source code
 Ngày tạo: 2026-06-26
 Lưu ý: Chạy script này trên ParkingManagementDB
====================================================================
*/

USE ParkingManagementDB;
GO

PRINT N'=== BẮT ĐẦU DỌN DẸP DATABASE ===';
GO

/* ================================================================
   BƯỚC 1: XÓA FOREIGN KEY CONSTRAINTS TRƯỚC
   (Cần xóa FK trước khi xóa bảng / cột)
   ================================================================ */

-- FK từ Requests.RelatedPenaltyID → Penalties (phải xóa trước khi xóa Penalties)
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Requests_Penalties')
BEGIN
    ALTER TABLE dbo.Requests DROP CONSTRAINT FK_Requests_Penalties;
    PRINT N'Đã xóa FK_Requests_Penalties';
END;
GO

-- FK từ Notifications → Penalties
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Notifications_Penalties')
BEGIN
    ALTER TABLE dbo.Notifications DROP CONSTRAINT FK_Notifications_Penalties;
    PRINT N'Đã xóa FK_Notifications_Penalties';
END;
GO

/* ================================================================
   BƯỚC 2: XÓA CÁC BẢNG KHÔNG DÙNG (THEO THỨ TỰ ĐÚNG)
   ================================================================ */

-- 1. PenaltyHistories (phụ thuộc Penalties)
IF OBJECT_ID(N'dbo.PenaltyHistories', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.PenaltyHistories;
    PRINT N'Đã xóa bảng: PenaltyHistories';
END;
GO

-- 2. Penalties (phụ thuộc Violations)
IF OBJECT_ID(N'dbo.Penalties', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Penalties;
    PRINT N'Đã xóa bảng: Penalties';
END;
GO

-- 3. Violations (phụ thuộc ParkingTickets, Vehicles, Cards, ParkingSlots, Staff, Admin, Requests)
IF OBJECT_ID(N'dbo.Violations', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Violations;
    PRINT N'Đã xóa bảng: Violations';
END;
GO

-- 4. Notifications (phụ thuộc Accounts, Reservations, Requests)
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Notifications;
    PRINT N'Đã xóa bảng: Notifications';
END;
GO

-- 5. AccessLogs (phụ thuộc ParkingTickets, Cards, Vehicles, Lanes, Staff, Floors, ParkingSlots)
IF OBJECT_ID(N'dbo.AccessLogs', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.AccessLogs;
    PRINT N'Đã xóa bảng: AccessLogs';
END;
GO

-- 6. AuditLogs (phụ thuộc Accounts, ParkingSlots, Reservations, Requests)
IF OBJECT_ID(N'dbo.AuditLogs', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.AuditLogs;
    PRINT N'Đã xóa bảng: AuditLogs';
END;
GO

-- 7. RequestNotes (phụ thuộc Requests, Accounts)
IF OBJECT_ID(N'dbo.RequestNotes', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.RequestNotes;
    PRINT N'Đã xóa bảng: RequestNotes';
END;
GO

-- 8. AlternativeSlotProposals (phụ thuộc Reservations, ParkingSlots, Staff)
IF OBJECT_ID(N'dbo.AlternativeSlotProposals', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.AlternativeSlotProposals;
    PRINT N'Đã xóa bảng: AlternativeSlotProposals';
END;
GO

-- 9. ReservationRestrictions (phụ thuộc [User])
IF OBJECT_ID(N'dbo.ReservationRestrictions', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.ReservationRestrictions;
    PRINT N'Đã xóa bảng: ReservationRestrictions';
END;
GO

-- 10. SystemSettings (phụ thuộc Accounts)
IF OBJECT_ID(N'dbo.SystemSettings', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.SystemSettings;
    PRINT N'Đã xóa bảng: SystemSettings';
END;
GO

PRINT N'';
PRINT N'=== BƯỚC 2 HOÀN THÀNH: Đã xóa 10 bảng không dùng ===';
GO

/* ================================================================
   BƯỚC 3: XÓA CÁC CỘT KHÔNG DÙNG TRONG BẢNG [User]
   DB có: ReservationLockedUntil, NoShowCountSnapshot
   Java entity KHÔNG có: các cột trên
   ================================================================ */

-- Xóa constraint CHECK trước khi xóa cột NoShowCountSnapshot
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_User_NoShow' AND parent_object_id = OBJECT_ID('dbo.[User]'))
BEGIN
    ALTER TABLE dbo.[User] DROP CONSTRAINT CK_User_NoShow;
    PRINT N'Đã xóa constraint CK_User_NoShow';
END;
GO

-- Xóa cột ReservationLockedUntil
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.[User]') AND name = 'ReservationLockedUntil')
BEGIN
    ALTER TABLE dbo.[User] DROP COLUMN ReservationLockedUntil;
    PRINT N'Đã xóa cột: [User].ReservationLockedUntil';
END;
GO

-- Xóa cột NoShowCountSnapshot
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.[User]') AND name = 'NoShowCountSnapshot')
BEGIN
    ALTER TABLE dbo.[User] DROP COLUMN NoShowCountSnapshot;
    PRINT N'Đã xóa cột: [User].NoShowCountSnapshot';
END;
GO

/* ================================================================
   BƯỚC 4: XÓA CÁC CỘT KHÔNG DÙNG TRONG BẢNG Requests
   DB có nhiều cột snapshot không được map trong Java entity
   ================================================================ */

-- VehiclePlateSnapshot
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Requests') AND name = 'VehiclePlateSnapshot')
BEGIN
    ALTER TABLE dbo.Requests DROP COLUMN VehiclePlateSnapshot;
    PRINT N'Đã xóa cột: Requests.VehiclePlateSnapshot';
END;
GO

-- VehicleTypeSnapshot
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Requests') AND name = 'VehicleTypeSnapshot')
BEGIN
    ALTER TABLE dbo.Requests DROP COLUMN VehicleTypeSnapshot;
    PRINT N'Đã xóa cột: Requests.VehicleTypeSnapshot';
END;
GO

-- ExpectedEntryTime
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Requests') AND name = 'ExpectedEntryTime')
BEGIN
    ALTER TABLE dbo.Requests DROP COLUMN ExpectedEntryTime;
    PRINT N'Đã xóa cột: Requests.ExpectedEntryTime';
END;
GO

-- ParkingFloorCode
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Requests') AND name = 'ParkingFloorCode')
BEGIN
    ALTER TABLE dbo.Requests DROP COLUMN ParkingFloorCode;
    PRINT N'Đã xóa cột: Requests.ParkingFloorCode';
END;
GO

-- CurrentPlate
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Requests') AND name = 'CurrentPlate')
BEGIN
    ALTER TABLE dbo.Requests DROP COLUMN CurrentPlate;
    PRINT N'Đã xóa cột: Requests.CurrentPlate';
END;
GO

-- CorrectPlate
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Requests') AND name = 'CorrectPlate')
BEGIN
    ALTER TABLE dbo.Requests DROP COLUMN CorrectPlate;
    PRINT N'Đã xóa cột: Requests.CorrectPlate';
END;
GO

-- CurrentVehicleType
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Requests') AND name = 'CurrentVehicleType')
BEGIN
    ALTER TABLE dbo.Requests DROP COLUMN CurrentVehicleType;
    PRINT N'Đã xóa cột: Requests.CurrentVehicleType';
END;
GO

-- CorrectVehicleType
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Requests') AND name = 'CorrectVehicleType')
BEGIN
    ALTER TABLE dbo.Requests DROP COLUMN CorrectVehicleType;
    PRINT N'Đã xóa cột: Requests.CorrectVehicleType';
END;
GO

/* ================================================================
   BƯỚC 5: XÓA CÁC CỘT KHÔNG DÙNG TRONG BẢNG ParkingTickets
   Các cột ảnh biển số và mặt chưa được sử dụng
   ================================================================ */

-- EntryPlateImageURL
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ParkingTickets') AND name = 'EntryPlateImageURL')
BEGIN
    ALTER TABLE dbo.ParkingTickets DROP COLUMN EntryPlateImageURL;
    PRINT N'Đã xóa cột: ParkingTickets.EntryPlateImageURL';
END;
GO

-- ExitPlateImageURL
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ParkingTickets') AND name = 'ExitPlateImageURL')
BEGIN
    ALTER TABLE dbo.ParkingTickets DROP COLUMN ExitPlateImageURL;
    PRINT N'Đã xóa cột: ParkingTickets.ExitPlateImageURL';
END;
GO

-- EntryFaceImageURL
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ParkingTickets') AND name = 'EntryFaceImageURL')
BEGIN
    ALTER TABLE dbo.ParkingTickets DROP COLUMN EntryFaceImageURL;
    PRINT N'Đã xóa cột: ParkingTickets.EntryFaceImageURL';
END;
GO

-- ExitFaceImageURL
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ParkingTickets') AND name = 'ExitFaceImageURL')
BEGIN
    ALTER TABLE dbo.ParkingTickets DROP COLUMN ExitFaceImageURL;
    PRINT N'Đã xóa cột: ParkingTickets.ExitFaceImageURL';
END;
GO

PRINT N'';
PRINT N'=== HOÀN THÀNH DỌN DẸP DATABASE ===';
PRINT N'Đã xóa: 10 bảng không dùng';
PRINT N'Đã xóa: 14 cột không dùng';
PRINT N'Các bảng còn lại: Roles, Accounts, Admin, Staff, Customers, [User], Vehicles,';
PRINT N'  Floors, ParkingZones, ParkingSlots, Lanes, WorkShifts, StaffAssignments,';
PRINT N'  CardGroups, Cards, Reservations, ParkingTickets, Requests, Payments, CardHistories';
GO
